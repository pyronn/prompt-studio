import {Col, Image, Input, InputNumber, message, Row, Select, Slider, Switch} from "antd";
import PromptAutoInput from "@/components/PromptAutoInput";
import SortableButtonContainer from "@/components/SortableButtonContainer";
import {useEffect, useState} from "react";
import {arrayMove} from "@/lib/tools";


const modelOptions = {
    "niji6": {name: "niji6", paramName: "niji", paramValue: "6", showName: "Niji 6"},
    "v6": {name: "v6", paramName: "v", paramValue: "6", showName: "V 6"},
    "niji5": {name: "niji5", paramName: "niji", paramValue: "5", showName: "Niji 5"},
    "v5": {name: "v5", paramName: "v", paramValue: "5", showName: "V 5"},
    "v4": {name: "v4", paramName: "v", paramValue: "4", showName: "V 4"},
    "v3": {name: "v3", paramName: "v", paramValue: "3", showName: "V 3"},
    "niji4": {name: "niji4", paramName: "niji", paramValue: "4", showName: "Niji 4"},
}

const aspectOptions = ["1:1", "4:3", "16:9", "3:4", "9:16", "3:2", "2:3", "2:1", "1:2", "9:20"]


const styleOptions = ["default", "raw", "cute", "expressive", "original", "scenic"]

// 提示词右键菜单项
const promptContextMenuItems = [
    {
        label: '复制',
        key: 'copy'
    },
    {
        label: '移除',
        key: 'remove'
    },
    // TODO 编辑，权重
]

const zhPattern = /[\u4e00-\u9fa5\u3000-\u303f\uff0c\uff1b\uff1a\uff0e\uff1f\uff01\uff1e\uff1c\u201c\u201d\u2018\u2019]/

export default function PromptEditor({
                                         toggleDrawer,
                                         togglePromptDrawer,
                                         toggleHistory,
                                         dictPromptList,
                                         openSavePromptDialog,
                                         addToPromptHistory,
    isTextInDict,
    saveNewDictPromptDialog,
                                     }) {

    const [inputKeywords, setInputKeywords] = useState(''); // 输入的关键词
    const [finalKeywords, setFinalKeywords] = useState(''); // 最终的关键词
    const [imagePrompts, setImagePrompts] = useState([]); // 图片提示词
    const [selectedKeywords, setSelectedKeywords] = useState([]); // 所有的关键词列表，包括从词典添加的和输入的
    const [keywordTransText, setKeywordTransText] = useState({}); // 所有关键词列表对应的翻译文本
    const [activeKeywords, setActiveKeywords] = useState([]); // 所有关键词列表对应的激活状态,0和1表示
    const [outputKeywords, setOutputKeywords] = useState(''); // 输出的关键词


    const [model, setModel] = useState("niji6");
    const [aspect, setAspect] = useState("1:1");
    const [stylize, setStylize] = useState(100);
    const [style, setStyle] = useState("default");
    const [chaos, setChaos] = useState(0);
    const [imageWeight, setImageWeight] = useState(1);

    const defaultModel = "niji6"


    const [translateTimerId, setTranslateTimerId] = useState(null);
    const [inputTransTimer, setInputTransTimer] = useState(null);
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [addPromptPrefix, setAddPromptPrefix] = useState(false)

    const modelOption = modelOptions[model]?.name ? modelOptions[model] : modelOptions[defaultModel]
    const [systemParams, setSystemParams] = useState({
        model: {
            name: modelOption.paramName,
            value: modelOption.paramValue
        }
    });
    const [rawSelectedKeywords, setRawSelectedKeywords] = useState([]); // 文本框输入的原始未翻译的关键词列表


    const handleInputKeywordsChange = (event) => {
        const inputValue = event.target.value
        const oldValue = inputKeywords
        // setOldInputKeywords(oldValue)
        setInputKeywords(inputValue);
        parseInputKeywords(inputValue);
    };

    const onInputPrompt = (prompt) => {
        if (typeof prompt === "string") {
            if (prompt.startsWith("http")) {
                const newImagePrompt = new Array(...imagePrompts)
                newImagePrompt.push(prompt)
                setImagePrompts(newImagePrompt)
                return
            }
            addKeyword({
                text: prompt,
            })
        } else {
            addKeyword(prompt)
        }
    }

    const toggleKeyword = (index) => {
        const newActKeywords = new Array(...activeKeywords)
        newActKeywords[index] = activeKeywords[index] === 1 ? 0 : 1
        setActiveKeywords(newActKeywords)
    }

    const addKeyword = async (dictPrompt) => {
        const newSelected = new Array(...selectedKeywords)
        const word = dictPrompt.text
        const id = dictPrompt.id ? dictPrompt.id : Date.now()
        let transText = dictPrompt.transText ? dictPrompt.transText :
            (keywordTransText[dictPrompt.text.toLowerCase()] ? keywordTransText[dictPrompt.text.toLowerCase()] : "")

        if (transText === "") {
            const resp = await translate([word], !zhPattern.test(word) ? "zh" : "en")
            transText = resp[0]
        }
        if (!zhPattern.test(word)) {
            newSelected.push({word: word, transText: transText, id: id})
        } else {
            newSelected.push({word: transText, transText: transText, id: id})
        }

        if (transText !== undefined && transText !== "") {
            const newTransText = {...keywordTransText}
            newTransText[word.toLowerCase()] = transText
            newTransText[transText.toLowerCase()] = word
            setKeywordTransText(newTransText)
        }
        setSelectedKeywords(newSelected)

        if (activeKeywords.length === 1) {
            const newActive = activeKeywords.copyWithin(1, 0)
            newActive.push(1)
            setActiveKeywords(newActive)
        } else {
            const newActive = new Array(...activeKeywords)
            newActive.push(1)
            setActiveKeywords(newActive)
        }
    }


    const setDefaultSysParams = (sysParams) => {
        if (!('model' in sysParams)) {
            const curModel = modelOptions[model]
            sysParams['model'] = {name: curModel.paramName, value: curModel.paramValue}
        }
        if (!('style' in sysParams)) {
            sysParams['style'] = {name: 'style', value: "default"}
        }
        if (!('ar' in sysParams) && !('aspect' in sysParams)) {
            sysParams['ar'] = {name: 'ar', value: "1:1"}
        }
        if (!('s' in sysParams) && !('stylize' in sysParams)) {
            sysParams['s'] = {name: 's', value: 100}
        }
        if (!('c' in sysParams) && !('chaos' in sysParams)) {
            sysParams['c'] = {name: 'c', value: 0}
        }
        if (!('iw' in sysParams) && !('imageWeight' in sysParams)) {
            sysParams['iw'] = {name: 'iw', value: 1}
        }
    }

    const parseSystemParams = (sysParams) => {
        const params = {}
        Object.keys(sysParams).map((key) => {
            switch (key) {
                case "s":
                case "stylize":
                    setStylize(sysParams[key].value)
                    break
                case "style":
                    setStyle(sysParams[key].value)
                    break
                case "c":
                case "chaos":
                    setChaos(sysParams[key].value)
                    break
                case "iw":
                    setImageWeight(sysParams[key].value)
                    break
                case "ar":
                case "aspect":
                    setAspect(sysParams[key].value)
                    break
                case "model":
                    setModel(sysParams[key].name + sysParams[key].value)
                    break
                default:
                    break
            }
        })
        return params
    }

    const parsePrompt = (prompt) => {
        // 分离系统参数
        const systemParamsPart = prompt.match(/(--\w+ [^--]+)/g) || [];
        const nonSystemParamsPart = prompt.split(/--\w+ [^--]+/).join(' ').trim();

        // 分离图片链接和文本提示词
        const imageAndTextParts = nonSystemParamsPart.split(' ');
        const imagePrompts = [];
        let textPrompts = '';

        imageAndTextParts.forEach(part => {
            if (part.startsWith('http')) {
                // 当前部分是图片链接
                imagePrompts.push(part);
            } else {
                // 其余部分属于文本提示词
                textPrompts += part + ' ';
            }
        });

        textPrompts = textPrompts.trim();

        return {imagePrompts, textPrompts: textPrompts, sysParamsPrompt: systemParamsPart};
    }

    const parseTextPrompts = (textPrompts) => {
        const textPromptList = []
        const textWords = []
        textPrompts.split(',').map((kw, index) => {
            const id = Date.now() + Math.random() * 1000
            const parts = kw.trim().split('::');
            if (parts[0].trim() !== "") {
                const word = parts[0].trim()
                // 输入的词是中文则先翻译成英文
                if (zhPattern.test(word)) {
                    // 不是英文
                    const transText = keywordTransText[word.toLowerCase()]
                    if (transText === undefined || transText === "") {
                        textPromptList.push({
                            id: id,
                            word: word,
                            weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined
                        })
                        textWords.push(word)
                    } else {
                        textPromptList.push({
                            id: id,
                            word: transText,
                            weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined
                        })
                        textWords.push(word)
                    }
                } else {
                    textPromptList.push({
                        id: id,
                        word: word,
                        weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined
                    })
                    textWords.push(word)
                }
            }
        });
        return {textPromptList: textPromptList, textWords: textWords}
    }

    // 解析输入的关键词
    const parseInputKeywords = (inputValue) => {
        const inputKeyword = inputValue.trim();
        const sysParams = {}
        if (inputKeyword === "") {
            setInputKeywords("")
            setRawSelectedKeywords([])
            setActiveKeywords([])
            setImagePrompts([])
            setDefaultSysParams(sysParams)
            setSystemParams(sysParams)
            parseSystemParams(sysParams)
            return
        }
        // 把输入关键词解析为图像,文本提示词和系统参数
        const {imagePrompts, textPrompts, sysParamsPrompt} = parsePrompt(inputKeyword)
        // 解析文本提示词
        const {textPromptList: inputKeywordList} = parseTextPrompts(textPrompts)
        // 解析系统参数
        sysParamsPrompt.map((param) => {
            const p = param.replace("--", "")
            const name = p.split(' ')[0]
            const valueStr = p.split(' ')[1]
            let value = valueStr
            if (!isNaN(valueStr) && !isNaN(parseFloat(valueStr))) {
                value = parseFloat(valueStr)
            }
            let key = name
            switch (name) {
                case "v":
                case "niji":
                    key = "model"
                    break
                case "s":
                case "stylize":
                    key = "s"
                    break
                case "style":
                    key = "style"
                    break
                case "c":
                case "chaos":
                    key = "c"
                    break
                case "iw":
                    key = "iw"
                    break
                default:
                    break
            }
            sysParams[key] = {name: name, value: value}
        });

        // 设置默认的系统参数
        setDefaultSysParams(sysParams)

        const activeIndex = new Array(inputKeywordList.length).fill(1)
        // TODO 文本框清空的状态下输入提示词，会把从词典添加的提示词清空掉
        // if (selectedKeywords.length > 0) {
        //     inputKeywordList.push(...selectedKeywords)
        //     activeIndex.push(...activeKeywords)
        // }

        setImagePrompts(imagePrompts)
        setRawSelectedKeywords(inputKeywordList)
        setSystemParams(sysParams)
        parseSystemParams(sysParams)
        if (!autoTranslate) {
            setActiveKeywords(activeIndex);
            setSelectedKeywords(inputKeywordList)
        }
    }

    function useOutput() {
        setInputKeywords(outputKeywords)
    }

    function clearInput() {
        setInputKeywords("")
        setFinalKeywords("")
        setOutputKeywords("")
        setSelectedKeywords([])
        setActiveKeywords([])
        setImagePrompts([])
        const modelOption = modelOptions[model]
        setSystemParams({model: {name: modelOption.paramName, value: modelOption.paramValue}})
    }

    const copyToClipboard = async () => {
        addToPromptHistory()
        await copyTextToClipboard(finalKeywords)
    }

    const translate = async (keywords, tarLang = "zh") => {
        return await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: "tencent",
                tarLang: tarLang,
                textList: keywords
            })
        }).then(resp => resp.json()).then(resp => resp.data.targetList)
    }


    const translatePrompts = () => {
        const srcTextList = []
        // const srcTextObjList = []
        selectedKeywords.map((kw, index) => {
            const transText = keywordTransText[kw.word.toLowerCase()]
            if (transText === undefined || transText === "") {
                srcTextList.push(kw.word)
                // srcTextObjList.push({word: kw.word, index: index})
            }
        })
        if (srcTextList.length === 0) {
            return
        }
        translate(srcTextList).then((targetTextList) => {
            const newKeywordTransText = {...keywordTransText}
            srcTextList.map((item, index) => {
                newKeywordTransText[item.toLowerCase()] = targetTextList[index]
            })
            setKeywordTransText(newKeywordTransText)
        }).catch(err => {
            console.error(err)
            message.error("翻译失败")
        })
    }

    function removeImagePromptItem(index) {
        const newImagePrompt = new Array(...imagePrompts)
        newImagePrompt.splice(index, 1)
        setImagePrompts(newImagePrompt)
    }

    const copyTextToClipboard = async (text) => {
        if ('clipboard' in navigator) {
            navigator.clipboard.writeText(text).then(() => message.success("已复制到粘贴板")).catch(err => message.error("复制失败" + err))
        } else {
            message.warning("浏览器不支持复制到粘贴板")
        }
    }

    // 提示词右键菜单事件处理
    const promptContextMenuClick = async (item, promptText, idx) => {
        switch (item.key) {
            case "copy":
                await copyTextToClipboard(promptText)
                break
            case "remove":
                const newSelectedKeywords = new Array(...selectedKeywords)
                newSelectedKeywords.splice(idx, 1)
                setSelectedKeywords(newSelectedKeywords)
                const newActiveKeywords = new Array(...activeKeywords)
                newActiveKeywords.splice(idx, 1)
                setActiveKeywords(newActiveKeywords)
                const newKeywordTransText = new Array(...keywordTransText)
                newKeywordTransText.splice(idx, 1)
                setKeywordTransText(newKeywordTransText)
                break
        }
    }

    const handleKeywordSortChange = (activeId, overId) => {
        const oldIndex = selectedKeywords.findIndex(item => item.id === activeId);
        const newIndex = selectedKeywords.findIndex(item => item.id === overId);
        const newSelected = new Array(...arrayMove(selectedKeywords, oldIndex, newIndex))
        const newActive = new Array(...arrayMove(activeKeywords, oldIndex, newIndex))
        setSelectedKeywords(newSelected)
        setActiveKeywords(newActive)
    }

    const parseFinalKeyword = () => {
        const keywordList = []
        activeKeywords.forEach((val, index) => {
            if (val === 1) {
                keywordList.push(selectedKeywords[index].weight ? selectedKeywords[index].word + "::" + selectedKeywords[index].weight : selectedKeywords[index].word)
            }
        })
        const keywordStr = keywordList.join(", ")
        const systemParamStr = Object.keys(systemParams).map((key) => {
            if (systemParams[key].value === undefined || systemParams[key].value === "") {
                return ""
            }
            switch (key) {
                case "s":
                case "stylize":
                    if (systemParams[key].value === 100 || systemParams[key].value === "100") {
                        return ""
                    }
                    return `--s ${systemParams[key].value ? systemParams[key].value : ""}`
                case "style":
                    if (systemParams[key].value === "default") {
                        return ""
                    }
                    return `--style ${systemParams[key].value ? systemParams[key].value : ""}`
                case "c":
                case "chaos":
                    if (systemParams[key].value === "0" || systemParams[key].value === 0) {
                        return ""
                    }
                    return `--c ${systemParams[key].value ? systemParams[key].value : ""}`
                case "iw":
                    if (systemParams[key].value === "1" || systemParams[key].value === 1) {
                        return ""
                    }
                    return `--iw ${systemParams[key].value ? systemParams[key].value : ""}`
                case "ar":
                case "aspect":
                    if (systemParams[key].value === "1:1") {
                        return ""
                    }
                    return `--ar ${systemParams[key].value ? systemParams[key].value : ""}`
                case "model":
                    return `--${systemParams[key].name} ${systemParams[key].value ? systemParams[key].value : ""}`
                case "tile":
                    return `--tile`
                default:
                    return `--${systemParams[key].name} ${systemParams[key].value ? systemParams[key].value : ""}`
            }
        }).join(" ")
        const imaginePrefix = "/imagine prompt:"
        const imagePromptStr = imagePrompts.join(" ")
        const multiPrompts = imagePrompts.length > 0 ? imagePromptStr + " " + keywordStr + " " + systemParamStr : keywordStr + " " + systemParamStr
        setOutputKeywords(multiPrompts)
        setFinalKeywords(addPromptPrefix ? imaginePrefix + multiPrompts : multiPrompts)
    }

    function parseSystemForm() {
        const newObj = {...systemParams}

        const modelOption = modelOptions[model]
        newObj["model"] = {name: modelOption.paramName, value: modelOption.paramValue}

        newObj["style"] = {name: "style", value: style}
        newObj["ar"] = {name: "ar", value: aspect}
        newObj["s"] = {name: "s", value: stylize}
        newObj["c"] = {name: "c", value: chaos}
        newObj["iw"] = {name: "iw", value: imageWeight}

        setSystemParams(newObj)
    }

    const translateInput = () => {
        if (!autoTranslate) {
            setSelectedKeywords(rawSelectedKeywords)
            setActiveKeywords(new Array(rawSelectedKeywords.length).fill(1))
            return;
        }
        // 找出输入前后不同的提示词,并记录索引位置
        const srcTextList = [];
        const srcTextIndex = {}
        rawSelectedKeywords.map((kw, index) => {
            const word = kw.word
            if (zhPattern.test(word)) {
                srcTextList.push(word)
                srcTextIndex[word] = index
            }
        })
        if (srcTextList.length === 0) {
            setSelectedKeywords(rawSelectedKeywords)
            setActiveKeywords(new Array(rawSelectedKeywords.length).fill(1))
            return
        }
        translate(srcTextList, "en").then((targetTextList) => {
            const newSelected = new Array(...rawSelectedKeywords)
            const newKeywordTransText = {...keywordTransText}
            targetTextList.map((item, index) => {
                const word = srcTextList[index]
                const targetIndex = srcTextIndex[word]
                newKeywordTransText[word.toLowerCase()] = item
                newKeywordTransText[item.toLowerCase()] = word
                newSelected[targetIndex].word = item
            })
            setSelectedKeywords(newSelected)
            setKeywordTransText(newKeywordTransText)
            setActiveKeywords(new Array(newSelected.length).fill(1))
        }).catch(err => {
            console.error(err)
            message.error("翻译失败")
        })
    }

    useEffect(() => {
        if (inputTransTimer) {
            clearTimeout(inputTransTimer)
        }
        const timerId = setTimeout(() => {
            translateInput()
        }, 200)
        setInputTransTimer(timerId)
        return () => {
            if (inputTransTimer !== null) {
                clearTimeout(inputTransTimer)
            }
        }
    }, [rawSelectedKeywords])

    useEffect(() => {
        if (translateTimerId) {
            clearTimeout(translateTimerId)
        }
        const timerId = setTimeout(() => {
            if (autoTranslate) {
                translatePrompts()
            }
        }, 200)
        setTranslateTimerId(timerId)
        return () => {
            if (translateTimerId !== null) {
                clearTimeout(translateTimerId)
            }
        }
    }, [selectedKeywords]);

    useEffect(() => {
        parseFinalKeyword();
    }, [activeKeywords, selectedKeywords, systemParams, imagePrompts])

    useEffect(() => {
        parseSystemForm()
    }, [model, style, stylize, chaos, imageWeight, aspect]);

    return (
        <div className="flex">
            {/* 输入区域 */}
            <div className="w-1/3">
                <div className="bg-base-200 p-3 rounded-md w-full max-w-2xl mx-auto my-2">
                    <div className="border-b border-gray-300 pb-1">
                        <h2 className="text-black text-md font-bold">Prompt</h2>
                    </div>
                    <div className="mt-1.5">
                                <textarea placeholder={"粘贴你的提示词"}
                                          className="min-h-[10rem] w-full resize-none text-black-300 font-mono bg-gray-300 p-2 rounded-t-md bordered"
                                          onChange={handleInputKeywordsChange}
                                          value={inputKeywords}
                                />
                        <div className={`p-1 bg-gray-200`}>
                            <Switch checkedChildren="自动翻译" unCheckedChildren="不翻译"
                                    checked={autoTranslate}
                                    onChange={(checked) => {
                                        setAutoTranslate(checked)
                                    }}/>
                            <Switch checkedChildren="添加指令前缀" unCheckedChildren="不添加指令前缀"
                                    checked={addPromptPrefix}
                                    onChange={(checked) => {
                                        setAddPromptPrefix(checked)
                                    }}/>
                        </div>
                        <div
                            className="overflow-wrap break-words w-full text-sm text-gray-200 font-mono bg-gray-700 p-1.5 rounded-b-md bordered">
                            {finalKeywords}
                        </div>
                    </div>
                    <div className={'divider m-0.5'}></div>
                    {/* 系统参数*/}
                    <div className={'bg-base-300 p-1 rounded rounded-2'}>
                        <div className={`p-1`}>
                            <label className={`label text-xs`}>
                                <span className={`label-text`}>系统参数:</span>
                            </label>
                        </div>
                        <div className={``}>
                            <div className={`bordered p-1`}>
                                <label className={`label text-xs w-1/4 inline-block`}>
                                    <span className={`label-text`}>模型:</span>
                                </label>
                                <Select className={`inline-block`}
                                        onChange={(val) => setModel(val)}
                                        value={model}
                                        options={Object.values(modelOptions).map((modelOption) => {
                                            return {value: modelOption.name, label: modelOption.showName}
                                        })}>
                                </Select>
                            </div>
                            <div className={`bordered`}>
                                <Row>
                                    <Col span={6}>
                                        <label className={`label text-xs`}>
                                            <span className={`label-text`}>--ar 图片尺寸:</span>
                                        </label>
                                    </Col>
                                    <Col>
                                        <Select className={`max-w-xs inline-block`}
                                                onChange={(value) => {
                                                    setAspect(value)
                                                }}
                                                value={aspect}
                                                options={aspectOptions.map((aspectOption) => {
                                                        return {value: aspectOption, label: aspectOption}
                                                    }
                                                )}
                                        >
                                        </Select>
                                    </Col>
                                </Row>
                            </div>
                            <Row>
                                <Col span={6}>

                                    <label className={`text-xs w-1/4`}>
                                        <span className={`label-text`}>--s 风格化:</span>
                                    </label>
                                </Col>
                                <Col span={10}>
                                    <Slider
                                        min={0}
                                        step={10}
                                        max={1000}
                                        onChange={(value) => setStylize(value)}
                                        value={stylize}
                                    />
                                </Col>
                                <Col span={6}>
                                    <InputNumber width={10}
                                                 min={0}
                                                 max={1000}
                                                 value={stylize}
                                                 onChange={(value) => setStylize(value)}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6}>
                                    <label className={`text-xs w-1/4 items-center`}>
                                        <span className={`label-text`}>--style 风格:</span>
                                    </label>
                                </Col>
                                <Col span={6}>
                                    <Input type={`text`} value={style}
                                           onChange={(e) => {
                                               setStyle(e.target.value)
                                           }}/>
                                </Col>
                                <Col span={12}>
                                    <Select style={{width: 120}}
                                            onChange={(value) => {
                                                setStyle(value)
                                            }}
                                            value={style}
                                            options={styleOptions.map((styleOption) => {
                                                    return {value: styleOption, label: styleOption}
                                                }
                                            )}
                                    >
                                    </Select>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={6}>
                                    <label className={``}>
                                        <span className={`label-text`}>--c 多样性:</span>
                                    </label>
                                </Col>
                                <Col span={10}>
                                    <Slider min={0} max={100} value={chaos} step={1}
                                            onChange={(value) => {
                                                setChaos(value)
                                            }}/>
                                </Col>
                                <Col span={6}>
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        value={chaos} onChange={(value) => {
                                        setChaos(value)
                                    }}/>
                                </Col>


                            </Row>
                            <Row>
                                <Col span={6}>
                                    <label>
                                        <span className={`label-text`}>--iw 图片权重:</span>
                                    </label>
                                </Col>
                                <Col span={10}>
                                    <Slider min={0} max={2} value={imageWeight} step={0.25}
                                            onChange={(value) => {
                                                setImageWeight(value)
                                            }}/>
                                </Col>
                                <Col span={6}>
                                    <InputNumber
                                        value={imageWeight} onChange={(value) => {
                                        setImageWeight(value)
                                    }}/>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    {/*按钮组*/}
                    <div className={`mt-2`}>
                        <button className={`btn btn-primary btn-sm m-1`} onClick={copyToClipboard}>
                            复制
                        </button>
                        <button className={`btn btn-primary btn-sm m-1`} onClick={translatePrompts}>
                            翻译
                        </button>
                        <button className={`btn btn-primary btn-sm m-1`} onClick={openSavePromptDialog(outputKeywords)}>
                            保存提示词
                        </button>
                        <button className={`btn btn-warning btn-sm m-1`} onClick={useOutput}>
                            输出提示词作为输入
                        </button>
                        <button className={`btn btn-error btn-sm m-1`} onClick={clearInput}>
                            清空
                        </button>
                    </div>
                    <div className={``}>
                        <div>
                            <button className={"m-1 btn btn-sm btn-secondary"}
                                    onClick={toggleDrawer}>查看提示词词典
                            </button>
                            <button className={"m-1 btn btn-sm btn-secondary"}
                                    onClick={togglePromptDrawer}>查看提示词收藏
                            </button>
                            <button className={`btn btn-sm btn-secondary m-1`} onClick={toggleHistory}>历史记录
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 中间提示词列表区域 */}
            <div className="w-2/5 px-2">
                <div className={"mt-4 w-full"}>
                    <PromptAutoInput items={dictPromptList} onInputPrompt={onInputPrompt}/>
                </div>
                <div className="mt-4">
                    <h2>ImagePrompt</h2>
                    <div className={'divider m-0 p-0'}></div>
                    <div className={"flex"}>
                        {
                            imagePrompts.map((item, index) => (
                                <div className={'relative m-1 p-1'} key={index}>
                                    <Image width={80} className={'w-2 p-1'} src={item}/>
                                    <button
                                        className={'absolute right-0 top-0 m-0 p-1 lef btn-error btn btn-xs'}
                                        onClick={() => {
                                            removeImagePromptItem(index)
                                        }}>
                                        x
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="mt-4">
                    <h2>TextPrompt</h2>
                    <div className={'divider m-0 p-0'}></div>
                    <SortableButtonContainer items={selectedKeywords} onItemsChange={handleKeywordSortChange}
                                             activeKeywords={activeKeywords}
                                             saveNewDictPromptDialog={saveNewDictPromptDialog}
                                             toggleKeyword={toggleKeyword} isTextInDict={isTextInDict}
                                             transKeywords={keywordTransText}
                                             contextMenuClick={promptContextMenuClick}
                                             contextMenuItems={promptContextMenuItems}/>
                </div>
            </div>
        </div>
    )
}
