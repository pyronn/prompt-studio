"use client"
import {useEffect, useState} from 'react'
import Link from 'next/link';
import SortableButtonContainer from "@/components/SortableButtonContainer";
import PromptAutoInput from "@/components/PromptAutoInput";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {
    AutoComplete,
    Button,
    Checkbox,
    Col,
    Collapse,
    Drawer,
    Image,
    Input,
    InputNumber,
    List,
    message,
    Modal,
    Popover,
    Radio,
    Row,
    Select,
    Slider,
    Switch,
    Tooltip
} from "antd";
import {ArrowLeft, Eraser, RefreshCwIcon, Trash} from "lucide-react";
import {arrayMove} from "@/lib/tools";


export default function Home() {

    const modelOptions = {
        "v6": {name: "v5.2", paramName: "v", paramValue: "6", showName: "V 6(Beta)"},
        "v5.2": {name: "v5.2", paramName: "v", paramValue: "5.2", showName: "V 5.2"},
        "niji5": {name: "niji5", paramName: "niji", paramValue: "5", showName: "Niji 5"},
        "v5.1": {name: "v5.1", paramName: "v", paramValue: "5.1", showName: "V 5.1"},
        "v5": {name: "v5", paramName: "v", paramValue: "5", showName: "V 5"},
        "v4": {name: "v4", paramName: "v", paramValue: "4", showName: "V 4"},
        "v3": {name: "v3", paramName: "v", paramValue: "3", showName: "V 3"},
        "niji4": {name: "niji4", paramName: "niji", paramValue: "4", showName: "Niji 4"},
    }


    const aspectOptions = ["1:1", "4:3", "16:9", "3:4", "9:16", "3:2", "2:3", "2:1", "1:2"]

    const styleOptions = ["default", "raw", "cute", "expressive", "original", "scenic"]

    const [messageApi, contextHolder] = message.useMessage()

    const [dictModalOpen, setDictModalOpen] = useState(false)
    const [promptModalOpen, setPromptModalOpen] = useState(false)
    const [promptModalLoading, setPromptModalLoading] = useState(false)
    const [dictModalLoading, setDictModalLoading] = useState(false)
    const [dictDirOptions, setDictDirOptions] = useState([])
    const [promptListLoading, setPromptListLoading] = useState(false)
    const [dictListLoading, setDictListLoading] = useState(false)

    const [isPreviewImgShow, setIsPreviewImgShow] = useState(false)
    const [previewImgLink, setPreviewImgLink] = useState("")

    const [inputKeywords, setInputKeywords] = useState(''); // 输入的关键词
    const [finalKeywords, setFinalKeywords] = useState(''); // 最终的关键词
    const [outputKeywords, setOutputKeywords] = useState(''); // 输出的关键词
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 是否打开抽屉
    const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false); // 是否打开抽屉
    const [allCategoryPrompts, setAllCategoryPrompts] = useState([]); // 所有的提示词
    const [dictCategoryDirs, setDictCategoryDirs] = useState([]); // 词典分类
    const [dictPromptList, setDictPromptList] = useState([]); // 词典全部列表
    const [curDictCategoryIndex, setCurDictCategoryIndex] = useState(""); // 当前的词典分类

    const [isPromptDictLoaded, setIsPromptDictLoaded] = useState(false); // 是否已经加载了notion词典
    const [subCategoryPrompts, setSubCategoryPrompts] = useState({}); // 二级分类的提示词
    const [isNotionEnable, setIsNotionEnable] = useState(false); // 是否启用notion词典
    const [notionToken, setNotionToken] = useState(""); // notion token
    const [notionDatabaseId, setNotionDatabaseId] = useState(""); // notion database id
    const [isOnlyNotion, setIsOnlyNotion] = useState(false); // 是否只使用notion词典

    const [prompts, setPrompts] = useState([]); // 所有的提示词
    const [promptsCategories, setPromptsCategories] = useState([]); // 词库分类
    const [curPromptCategory, setCurPromptCategory] = useState("全部"); // 当前的词库分类
    const [promptHistory, setPromptHistory] = useState([]); // 提示词历史记录
    const [promptHistoryOpen, setPromptHistoryOpen] = useState(false); // 提示词历史记录

    // 系统参数
    const [stylize, setStylize] = useState(100);
    const [model, setModel] = useState("niji5");
    const [style, setStyle] = useState("default");
    const [chaos, setChaos] = useState(0);
    const [imageWeight, setImageWeight] = useState(1);
    const [aspect, setAspect] = useState("1:1");


    const [selectedKeywords, setSelectedKeywords] = useState([]); // 所有的关键词列表，包括从词典添加的和输入的
    const [rawSelectedKeywords, setRawSelectedKeywords] = useState([]); // 文本框输入的原始未翻译的关键词列表
    const [activeKeywords, setActiveKeywords] = useState([]); // 所有关键词列表对应的激活状态,0和1表示
    const [keywordTransText, setKeywordTransText] = useState({}); // 所有关键词列表对应的翻译文本
    const [imagePrompts, setImagePrompts] = useState([]); // 图片提示词
    const modelOption = modelOptions[model]
    const [systemParams, setSystemParams] = useState({
        model: {
            name: modelOption.paramName,
            value: modelOption.paramValue
        }
    });

    const [newDictPromptText, setNewDictPromptText] = useState("");
    const [newDictPromptTransText, setNewDictPromptTransText] = useState("");
    const [newDictPromptDir, setNewDictPromptDir] = useState("");

    const [newPromptTitle, setNewPromptTitle] = useState("");
    const [newPromptDesc, setNewPromptDesc] = useState("");
    const [newPromptCategory, setNewPromptCategory] = useState("");
    const [newPromptRawPrompt, setNewPromptRawPrompt] = useState("");
    const [newPromptSampleImgLink, setNewPromptSampleImgLink] = useState("");
    const [promptEdit, setPromptEdit] = useState(false);
    const [editPromptId, setEditPromptId] = useState("");

    const [translateTimerId, setTranslateTimerId] = useState(null);
    const [inputTransTimer, setInputTransTimer] = useState(null);
    const [autoTranslate, setAutoTranslate] = useState(true);


    const handleInputKeywordsChange = (event) => {
        const inputValue = event.target.value
        const oldValue = inputKeywords
        // setOldInputKeywords(oldValue)
        setInputKeywords(inputValue);
        parseInputKeywords(inputValue);
    };

    const onEnableNotionDictChange = (e) => {
        setIsNotionEnable(e.target.checked)
        localStorage.setItem("enableNotionDict", e.target.checked)
    }

    const onNotionTokenChange = (e) => {
        setNotionToken(e.target.value)
        localStorage.setItem("notionToken", e.target.value)
    }

    function onOnlyNotionChange(e) {
        setIsOnlyNotion(e.target.checked)
        localStorage.setItem("onlyNotionDict", e.target.checked)
    }

    const onNotionDatabaseIdChange = (e) => {
        setNotionDatabaseId(e.target.value)
        localStorage.setItem("notionDatabaseId", e.target.value)
    }

    const saveNewDictPromptDialog = ({word, transText}) => {
        setDictModalOpen(true)
        setNewDictPromptTransText("")
        setNewDictPromptText("")
        setNewDictPromptDir("")
        let trans = transText === undefined ? "" : transText
        setNewDictPromptTransText(trans)
        setNewDictPromptText(word)
    };

    const saveNewDictPrompt = () => {
        if (!isNotionEnable) {
            message.warning("请先启用Notion", 3000).then(() => {
            })
            return
        }
        setDictModalLoading(true)
        const resp = fetch("api/dict", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            },
            body: JSON.stringify({
                text: newDictPromptText,
                transText: newDictPromptTransText,
                dir: newDictPromptDir
            })
        }).then(resp => {
            setDictModalLoading(false)
            setDictModalOpen(false)
            setNewDictPromptTransText("")
            setNewDictPromptText("")
            setNewDictPromptDir("")
            message.success("保存成功")
        }).catch(err => {
            setDictModalLoading(false)
            setNewDictPromptTransText("")
            setNewDictPromptText("")
            setNewDictPromptDir("")
            message.error("保存失败" + err)
        });

    };

    /**
     * 提示词保存
     */
    const saveNewPrompt = () => {
        if (!isNotionEnable) {
            message.warning("请先启用Notion")
            return
        }
        setPromptModalLoading(true)
        const resp = fetch("api/prompt", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            },
            body: JSON.stringify({
                title: newPromptTitle,
                desc: newPromptDesc,
                category: newPromptCategory,
                rawPrompt: newPromptRawPrompt,
                sampleImgLink: newPromptSampleImgLink,
            })
        }).then(resp => {
            setPromptModalLoading(false)
            setPromptModalOpen(false)
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            message.success("保存成功")
            loadPromptAll()
        }).catch(err => {
            setPromptModalLoading(false)
            // setPromptModalOpen(false)
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            message.error("保存失败" + err)
        })

    };

    const updatePrompt = () => {
        if (!isNotionEnable) {
            message.warning("请先启用Notion")
            return
        }
        setPromptModalLoading(true)
        const resp = fetch("api/prompt", {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            },
            body: JSON.stringify({
                id: editPromptId,
                title: newPromptTitle,
                desc: newPromptDesc,
                category: newPromptCategory,
                rawPrompt: newPromptRawPrompt,
                sampleImgLink: newPromptSampleImgLink,
            })
        }).then(resp => {
            setPromptModalLoading(false)
            setPromptModalOpen(false)
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            message.success("保存成功")
            loadPromptAll()
        }).catch(err => {
            setPromptModalLoading(false)
            // setPromptModalOpen(false)
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            message.error("保存失败" + err)
        })

    };

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

    const toggleKeyword = (index) => {
        const newActKeywords = new Array(...activeKeywords)
        newActKeywords[index] = activeKeywords[index] === 1 ? 0 : 1
        setActiveKeywords(newActKeywords)
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
            const value = p.split(' ')[1]
            let key = name
            if (name === 'niji' || name === 'v') {
                key = 'model'
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

    const parseTextPrompts = (textPrompts) => {
        const textPromptList = []
        const textWords = []
        textPrompts.split(',').map((kw, index) => {
            const id = Date.now() + Math.random() * 1000
            const parts = kw.trim().split('::');
            if (parts[0].trim() !== "") {
                const word = parts[0].trim()
                // 输入的词不是英文或英文词组则先翻译成英文
                if (!/^[0-9A-Za-z\s.,?!]+$/.test(word)) {
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

    const setDefaultSysParams = (sysParams) => {
        if (!('model' in sysParams)) {
            const curModel = modelOptions[model]
            sysParams['model'] = {name: curModel.paramName, value: curModel.paramValue}
        }
        if (!('style' in sysParams)) {
            sysParams['style'] = {name: 'style', value: "default"}
        }
        if (!('ar' in sysParams)) {
            sysParams['ar'] = {name: 'ar', value: "1:1"}
        }
        if (!('s' in sysParams)) {
            sysParams['s'] = {name: 's', value: 100}
        }
        if (!('c' in sysParams)) {
            sysParams['c'] = {name: 'c', value: 0}
        }
        if (!('iw' in sysParams)) {
            sysParams['iw'] = {name: 'iw', value: 1}
        }
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

    // 翻译输入的提示词，翻译为英文
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
            if (!/^[0-9A-Za-z\s.,?!]+$/.test(word)) {
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

    const copyToClipboard = async () => {
        addToPromptHistory()
        if ('clipboard' in navigator) {
            navigator.clipboard.writeText(finalKeywords).then(() => message.success("已复制到粘贴板")).catch(err => message.error("复制失败" + err))
        } else {
            message.warning("浏览器不支持复制到粘贴板")
        }
    }

    const addKeyword = async (dictPrompt) => {
        const newSelected = new Array(...selectedKeywords)
        const word = dictPrompt.text
        const id = dictPrompt.id ? dictPrompt.id : Date.now()
        let transText = dictPrompt.transText ? dictPrompt.transText :
            (keywordTransText[dictPrompt.text.toLowerCase()] ? keywordTransText[dictPrompt.text.toLowerCase()] : "")

        if (transText === "") {
            const resp = await translate([word], /^[0-9A-Za-z\s.,?!]+$/.test(word) ? "zh" : "en")
            transText = resp[0]
        }
        if (/^[0-9A-Za-z\s.,?!]+$/.test(word)) {
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

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
        if (!isPromptDictLoaded) {
            loadAllCategoryKeywords().then(() => {
                setIsPromptDictLoaded(true)
            })
        }
    }

    const togglePromptDrawer = () => {

        setIsPromptDrawerOpen(!isPromptDrawerOpen)
        if (!isPromptDrawerOpen) {
            loadPromptAll().catch(err => {
                message.error("load prompt failed" + err)
            })
        }
    }

    const loadPromptAll = async () => {
        if (!isNotionEnable) {
            return
        }
        setPromptListLoading(true)
        const data = fetch("/api/prompt", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            }
        }).then(res => res.json()).then(res => res.data).then(data => {
            const result = data
            const cateSet = new Set()
            result.map((item) => {
                if (item.category !== undefined && item.category !== "其他") {
                    cateSet.add(item.category)
                }
            })
            const cateArr = [...cateSet.values()]
            setPrompts(result)
            setPromptsCategories(cateArr)
            setPromptListLoading(false)
        });
    }

    const handleKeywordSortChange = (activeId, overId) => {
        const oldIndex = selectedKeywords.findIndex(item => item.id === activeId);
        const newIndex = selectedKeywords.findIndex(item => item.id === overId);
        const newSelected = new Array(...arrayMove(selectedKeywords, oldIndex, newIndex))
        const newActive = new Array(...arrayMove(activeKeywords, oldIndex, newIndex))
        setSelectedKeywords(newSelected)
        setActiveKeywords(newActive)
    }


    const onDictCategoryClick = (e) => {
        const index = e.target.value
        setCurDictCategoryIndex(index)
        const category = allCategoryPrompts[index]
        const subCatePrompts = {}
        category.children.map((cate) => {
            subCatePrompts[cate.name] = cate.texts
        })
        setSubCategoryPrompts(subCatePrompts)
    }

    /**
     * 解析词典分类路径列表用于快速选择
     * @param dictKeywords
     */
    const parseAllDictDirs = (dictKeywords) => {
        const dirs = new Set()
        dictKeywords.map((item) => {
            if (item.children === undefined || item.children.length === 0) {
                return
            }
            item.children.map((subCate) => {
                if (subCate.texts !== undefined && subCate.texts.length > 0) {
                    subCate.texts.map((text) => {
                        dirs.add(text.dir)
                    })
                }
            })
        })
        setDictCategoryDirs([...dirs.values()])
    }

    const parseAllDictText = (dictKeywords) => {
        const dictList = []
        const idSet = new Set()
        dictKeywords.map((item) => {
            if (item.children === undefined || item.children.length === 0) {
                return
            }
            item.children.map((subCate) => {
                if (subCate.texts !== undefined && subCate.texts.length > 0) {
                    subCate.texts.map((text) => {
                        if (idSet.has(text.id)) {
                            console.log("duplicate id", text.id, text.text)
                            return
                        }
                        idSet.add(text.id)
                        dictList.push(text)
                    })
                }
            })
        })
        setDictPromptList(dictList)
    }

    /**
     * 词典加载
     * @returns {Promise<void>}
     */
    const loadAllCategoryKeywords = async () => {
        setDictListLoading(true)
        if (!isNotionEnable) {
            const resp = await fetch('/api/dict/local', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const result = await resp.json()
            parseAllDictDirs(result.data)
            parseAllDictText(result.data)
            setAllCategoryPrompts(result.data)
            setDictListLoading(false)
            return
        }
        const resp = await fetch('/api/dict', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            }
        })
        const result = await resp.json()
        if (!isOnlyNotion) {
            const localResp = await fetch('/api/dict/local', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const localResult = await localResp.json()
            result.data = result.data.concat(localResult.data)
        }
        parseAllDictDirs(result.data)
        parseAllDictText(result.data)
        setAllCategoryPrompts(result.data)
        setDictListLoading(false)
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
        setIsNotionEnable(localStorage.getItem("enableNotionDict") === "true")
        setIsOnlyNotion(localStorage.getItem("onlyNotionDict") === "true")
        setNotionToken(localStorage.getItem("notionToken"))
        setNotionDatabaseId(localStorage.getItem("notionDatabaseId"))
        setPromptHistory(JSON.parse(localStorage.getItem("promptHistory") || "[]"))
        loadAllCategoryKeywords().catch(err => {
            console.log("loadDictFailed", err)
        })
        loadPromptAll().catch(err => {
            console.log("loadPromptFailed", err)
        })
    }, [])

    useEffect(() => {
        parseSystemForm()
    }, [model, style, stylize, chaos, imageWeight, aspect]);

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
                    return ""
            }
        }).join(" ")
        const imaginePrefix = "/imagine prompt:"
        const imagePromptStr = imagePrompts.join(" ")
        setOutputKeywords(imagePromptStr + " " + keywordStr + " " + systemParamStr)
        setFinalKeywords(imaginePrefix + " " + imagePromptStr + " " + keywordStr + " " + systemParamStr)
    }

    const addToPromptHistory = () => {
        if (outputKeywords === "") {
            return
        }
        const now = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        }).format(Date.now())
        const history = [{prompt: outputKeywords, time: now}, ...promptHistory]
        if (history.length > 20) {
            const his = history.slice(0, 20)
            localStorage.setItem("promptHistory", JSON.stringify(history))
            setPromptHistory(history)
            return;
        }
        localStorage.setItem("promptHistory", JSON.stringify(history))
        setPromptHistory(history)
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

    function saveNewPromptDialog() {
        if (!isNotionEnable) {
            message.warning("请先启用Notion")
            return
        }
        setPromptEdit(false)
        setNewPromptTitle("");
        setNewPromptCategory("")
        setNewPromptDesc("")
        setNewPromptSampleImgLink("")
        setNewPromptRawPrompt(outputKeywords)
        setPromptModalOpen(true)
    }

    function usePrompt(rawPrompt) {
        setInputKeywords(rawPrompt)
        parseInputKeywords(rawPrompt)
        togglePromptDrawer()
    }

    function previewPromptImage(promptItem) {
        setIsDrawerOpen(false)
        setIsPromptDrawerOpen(false)
        setPreviewImgLink(promptItem.sampleImage)
        setIsPreviewImgShow(true)
    }

    function closePreviewImg() {
        setPreviewImgLink("")
        setIsPreviewImgShow(false)
    }

    function removeImagePromptItem(index) {
        const newImagePrompt = new Array(...imagePrompts)
        newImagePrompt.splice(index, 1)
        setImagePrompts(newImagePrompt)
    }

    function useOutput() {
        setInputKeywords(outputKeywords)
    }

    const notionConfigPopoverContent = (
        <div className={`flex flex-col space-y-2`}>
            <div>
                <Checkbox
                    checked={isNotionEnable}
                    onChange={onEnableNotionDictChange}>是否启用Notion</Checkbox>
            </div>
            <div>
                <Checkbox
                    checked={isOnlyNotion}
                    onChange={onOnlyNotionChange}>是否只使用notion词典</Checkbox>
            </div>
            <div className={`p-1`}>
                <label className={`label text-xs z-20`}>NotionToken:</label>
                <Input type='text'
                       name={`notionToken`}
                       placeholder={`NotionToken`} value={notionToken}
                       onChange={onNotionTokenChange} disabled={!isNotionEnable}/>

            </div>
            <div className={`p-1`}>
                <label className={`label text-xs`}>NotionDatabaseID:</label>
                <Input type='text'
                       name={`notionDatabaseId`}
                       value={notionDatabaseId}
                       placeholder={`NotionDatabaseID`}
                       onChange={onNotionDatabaseIdChange} disabled={!isNotionEnable}/>
            </div>
        </div>
    )

    /**
     * 使用历史记录提示词
     * @param item
     */
    const useHistory = (item) => {
        setInputKeywords(item.prompt)
        setPromptHistoryOpen(false)
    };

    /**
     * 删除历史记录提示词
     * @param item
     * @param index
     */
    const deleteHistory = (item, index) => {
        const newHistory = new Array(...promptHistory)
        newHistory.splice(index, 1)
        setPromptHistory(newHistory)
        localStorage.setItem("promptHistory", JSON.stringify(newHistory))
    };

    const isTextInDict = (text) => {
        return dictPromptList.filter((item) => item.text === text).length > 0
    }


    function editPrompt(prompt) {
        setEditPromptId(prompt.id)
        setPromptEdit(true)
        setNewPromptTitle(prompt.title);
        setNewPromptCategory(prompt.category)
        setNewPromptDesc(prompt.desc)
        setNewPromptSampleImgLink(prompt.sampleImage)
        setNewPromptRawPrompt(prompt.rawPrompt)
        setPromptModalOpen(true)
    }

    return (

        <main className="bg-white">
            <nav className="bg-white text-gray-500 shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between">
                        <div className="flex space-x-4">
                            {/* Logo */}
                            <div className={`flex`}>
                                <Link href={""} className={`flex items-center`}>
                                    <span><img className={`w-8`} src={`favicon.ico`} alt={''}/></span>
                                </Link>
                                <Link href="/" className={"flex items-center py-5 px-5 text-black"}>
                                    <h1 className="font-bold">PromptStudio</h1>
                                </Link>

                            </div>
                            {/*Primary Nav*/}
                            <div className="hidden md:flex  space-x-1 items-center">
                                <Link href={"https://github.com/pyronn/prompt-repo"}>
                                    <svg t="1701159477788" className="icon" viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" p-id="4354" width="16" height="16">
                                        <path
                                            d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667"
                                            fill="#231F20" p-id="4355"></path>
                                    </svg>
                                </Link>
                                {/*<button className="py-5 px-3" onClick={toggleDrawer}>*/}
                                {/*    提示词典*/}
                                {/*</button>*/}
                                {/*<button className="py-5 px-3" onClick={togglePromptDrawer}>*/}
                                {/*    提示词库*/}
                                {/*</button>*/}
                            </div>
                        </div>
                        <div className={`flex space-x-4`}>
                            <Popover content={notionConfigPopoverContent} trigger={"hover"}>
                                <Link href={'#'} className={`flex items-center`}>Notion配置
                                </Link>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/*/!* Mobile Menu *!/*/}
                {/*<div className="mobile-menu hidden md:hidden">*/}
                {/*    <Link href="/about">*/}
                {/*        <a className="block py-2 px-4 text-sm hover:bg-blue-700">关于我们</a>*/}
                {/*    </Link>*/}
                {/*    <Link href="/services">*/}
                {/*        <a className="block py-2 px-4 text-sm hover:bg-blue-700">服务</a>*/}
                {/*    </Link>*/}
                {/*    <Link href="/contact">*/}
                {/*        <a className="block py-2 px-4 text-sm hover:bg-blue-700">联系我们</a>*/}
                {/*    </Link>*/}
                {/*</div>*/}
            </nav>
            <div className="container mx-auto py-1 px-3">
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
                                                    defaultValue={style}
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
                                <button className={`btn btn-primary btn-sm m-1`} onClick={saveNewPromptDialog}>
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
                                    <button className={`btn btn-sm btn-secondary m-1`} onClick={() => {
                                        setPromptHistoryOpen(!promptHistoryOpen)
                                    }}>历史记录
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
                                                     transKeywords={keywordTransText}/>
                        </div>
                    </div>
                </div>


            </div>

            {/*词典抽屉*/}
            <div
                className={`fixed rounded-t-lg inset-y-0 z-50 right-0 w-1/3 h-screen bg-gray-200 transform transition-transform duration-300 ease-in-out 
                ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} bg-white shadow-lg`}
            >
                {/* 抽屉内容 */}
                <div className="p-4 card">
                    <div className={`card-title flex text-sm items-center justify-between`}>
                        <div>
                            <h3>
                                提示词词典
                            </h3>
                        </div>

                        <div className={`flex space-x-1`}>
                            <Button type={"primary"} loading={dictListLoading} onClick={loadAllCategoryKeywords}>加载
                            </Button>
                            <Button icon={<CloseIcon/>} type={"text"} onClick={(e) => setIsDrawerOpen(false)}>
                            </Button>
                        </div>

                    </div>

                    <div className={`card-body h-screen `}>
                        {/*一级分类*/}
                        <Radio.Group value={curDictCategoryIndex} buttonStyle="solid" onChange={onDictCategoryClick}>
                            {
                                allCategoryPrompts.map((category, index) => (
                                    <Radio.Button key={index} value={index}>{category.name}</Radio.Button>
                                ))
                            }
                        </Radio.Group>
                        {/*二级分类和词典*/}
                        <div className={`overflow-y-auto`}>
                            <Collapse
                                size="small"
                                items={
                                    Object.keys(subCategoryPrompts).map((subCateName, index) => {
                                        return {
                                            key: index,
                                            label: subCateName,
                                            children: subCategoryPrompts[subCateName].map((prompt) => (
                                                    <div key={prompt.id}
                                                         className={`inline-block p-1 m-0.25 rounded-lg cursor-pointer hover:cursor-pointer text-xs`}
                                                         onClick={(e) => addKeyword(prompt)}>
                                                        <div
                                                            className={`rounded-s-lg inline-block p-1 text-white bg-green-400`}>
                                                            {prompt.text}
                                                        </div>
                                                        <div
                                                            className={`${prompt.transText === undefined || prompt.transText === "" ? "hidden" : "show"} rounded-e-lg inline-block p-1 text-white bg-blue-400`}>
                                                            {prompt.transText}
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        }
                                    })
                                }
                            />
                        </div>
                    </div>
                    {/* 其他组件 */}
                </div>

            </div>
            {/*词典保存对话框*/}
            <Modal title={"保存提示词词典"}
                   confirmLoading={dictModalLoading}
                   open={dictModalOpen}
                   onOk={saveNewDictPrompt}
                   onCancel={() => {
                       setDictModalOpen(false)
                   }}
            >
                <div>
                    <div className={`p-1`}>
                        <Row>
                            <Col span={24}>
                                <Input type="text" placeholder="提示词原文"
                                       disabled={true}
                                       name={`text`} value={newDictPromptText} onChange={(e) => {
                                    setNewDictPromptText(e.target.value)
                                }}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Input type="text" placeholder="输入提示词翻译"
                                       name={`transText`} value={newDictPromptTransText} onChange={(e) => {
                                    setNewDictPromptTransText(e.target.value)
                                }}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <AutoComplete className={'w-full'}
                                              placeholder={"输入词典分类路径"}
                                              value={newDictPromptDir}
                                              options={dictDirOptions}
                                              onSelect={(val) => setNewDictPromptDir(val)}
                                              onChange={(val) => setNewDictPromptDir(val)}
                                              onSearch={(query) => {
                                                  setDictDirOptions(query ? dictCategoryDirs.filter(item => item.includes(query)).map(item => {
                                                      return {
                                                          label: (<span>{item}</span>),
                                                          value: item
                                                      }

                                                  }) : [])
                                              }}
                                >
                                </AutoComplete>
                            </Col>
                            <Col span={12}>
                                <Select className={`inline-block w-full`}
                                        placeholder={"输入词典分类路径"}
                                        value={newDictPromptDir}
                                        onChange={(val) => setNewDictPromptDir(val)}
                                        options={dictCategoryDirs.map((item) => {
                                            return {value: item, label: item}
                                        })}>
                                </Select>
                            </Col>
                        </Row>


                    </div>
                </div>
            </Modal>

            {/*词库抽屉*/}
            <div
                // className={`fixed rounded-t-lg inset-y-0 z-50 right-0 w-2/3 h-screen bg-gray-200 transform transition-transform duration-300 ease-in-out
                className={`fixed rounded rounded-t-lg inset-x-0 z-50 bottom-0 w-full  bg-base-200 transform transition-transform duration-300 ease-in-out 
                ${isPromptDrawerOpen ? 'translate-y-0' : 'translate-y-full'} shadow-lg`}
            >
                {/* 抽屉内容 */}
                <div className="p-2 card h-full">
                    <div className={`p-2 card-title flex text-sm flex-between w-full items-center justify-between`}>
                        <div>
                            <h2>
                                提示词库
                            </h2>
                        </div>

                        <div className={`space-x-1`}>
                            <Button loading={promptListLoading} icon={<RefreshCwIcon onClick={() => {
                                loadPromptAll().catch(err => message.error("load prompt failed" + err))
                            }}/>}/>
                            <Button icon={<CloseIcon/>} onClick={(e) => setIsPromptDrawerOpen(false)}/>
                        </div>
                    </div>

                    <div className={`card-body p-2 h-full`}>
                        {isNotionEnable ? "" : <div>Notion数据库未启用</div>}
                        <Radio.Group value={curPromptCategory} buttonStyle="solid" onChange={(e) => {
                            setCurPromptCategory(e.target.value)
                        }}>
                            {
                                ["全部", ...promptsCategories, "其他"].map((category, index) => (
                                    <Radio.Button key={index} value={category}>{category}</Radio.Button>
                                ))
                            }
                        </Radio.Group>
                        <div className={`flex flex-wrap overflow-y-auto gap-4 h-96 p-1`}>
                            {prompts.filter(item => item.category === curPromptCategory || curPromptCategory === "全部").map((item, index) => (
                                <div
                                    className="w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48  aspect-w-1 aspect-h-1 relative overflow-hidden shadow-2xl shadow-base-200 rounded-xl"
                                >
                                    <img src={item.sampleImage} alt={item.desc}
                                         className="absolute inset-0 w-full h-full object-cover object-center"/>
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-50 flex text-white justify-end xs:text-xs items-start flex-col p-4"
                                        onClick={(e) => {
                                            previewPromptImage(item)
                                        }}>
                                        <div className={'flex flex-col w-full text-xs md:text-md lg:text-lg'}>
                                            <h5>{item.title}</h5>
                                            <p className="text-white text-xs">{item.desc}</p>
                                        </div>
                                        <div className={"space-x-4 w-full flex justify-end"}>
                                            <button className={`btn btn-info btn-sm`} onClick={(e) => {
                                                usePrompt(item.rawPrompt);
                                                e.stopPropagation();
                                            }}>使用
                                            </button>
                                            <button className={'btn btn-sm btn-primary'} onClick={(e) => {
                                                editPrompt(item)
                                                e.stopPropagation()
                                            }}>编辑
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 提示词保存*/}
            <Modal className={"w-11/12 max-w-5xl"}
                   title={"保存提示词"}
                   width={"w-5/6"}
                   confirmLoading={promptModalLoading}
                   open={promptModalOpen}
                   onOk={() => {
                       promptEdit ? updatePrompt() : saveNewPrompt()
                   }}
                   onCancel={() => {
                       setPromptModalOpen(false)
                   }}
            >
                <div>
                    <div className={`p-1 flex`}>
                        {newPromptSampleImgLink && newPromptSampleImgLink !== "" ?
                            <Image width={180} src={newPromptSampleImgLink} alt={``}/> :
                            <div className={'w-48 skeleton'}></div>
                        }

                        <div className={`flex flex-col w-1/3 m-2`}>
                            <Input type="text" placeholder="输入提示词标题"
                                   className=" m-1"
                                   name={`text`} value={newPromptTitle} onChange={(e) => {
                                setNewPromptTitle(e.target.value)
                            }}/>
                            <Row>
                                <Col span={12}>
                                    <Input type="text" placeholder="输入分类(只支持一级分类)"
                                           className="m-1"
                                           name={`text`} value={newPromptCategory} onChange={(e) => {
                                        setNewPromptCategory(e.target.value)
                                    }}/>
                                </Col>
                                <Col span={12}>
                                    <Select className={`inline-block w-full m-1`}
                                            onChange={(val) => setNewPromptCategory(val)}
                                            placeholder={"选择提示词分类分类"}
                                            value={newPromptCategory}
                                            options={promptsCategories.map((item) => {
                                                return {value: item, label: item}
                                            })}>
                                    </Select>
                                </Col>
                            </Row>
                            <Input type="text" placeholder="输入提示词描述"
                                   className="m-1"
                                   name={`transText`} value={newPromptDesc} onChange={(e) => {
                                setNewPromptDesc(e.target.value)
                            }}/>
                            <Input type="text" placeholder="示例图片链接"
                                   className="m-1"
                                   name={`sampleImage`} value={newPromptSampleImgLink} onChange={(e) => {
                                setNewPromptSampleImgLink(e.target.value)
                            }}/>

                        </div>
                        <div className={`w-2/5 m-2`}>
                                    <textarea placeholder="提示词原文"
                                              className="text-sm min-h-[8rem] w-full max-w-md resize-none font-mono p-2 rounded border-red-100"
                                              name={`rawPrompt`} value={newPromptRawPrompt}
                                              onChange={(e) => setNewPromptRawPrompt(e.target.value)}/>
                            {/*TODO 翻译*/}
                        </div>

                    </div>
                </div>
            </Modal>
            <Drawer title={"历史记录"} placement={"right"} open={promptHistoryOpen} onClose={() => {
                setPromptHistoryOpen(false)
            }} extra={
                <Tooltip title={"清空历史记录"}>
                    <button className={"btn btn-square btn-sm glass"} onClick={() => {
                        localStorage.setItem("promptHistory", "[]")
                        setPromptHistory([])
                    }}><Eraser size={20} color={"red"}/></button>
                </Tooltip>
            }>
                <List itemLayout={"vertical"}
                      dataSource={promptHistory}
                      renderItem={(item, index) => (
                          <List.Item actions={[
                              <button onClick={() => {
                                  useHistory(item)
                              }}><ArrowLeft size={15} color={"#1676fd"}/></button>,
                              <button onClick={() => {
                                  deleteHistory(item, index)
                              }}><Trash size={15} color={"red"}/></button>
                          ]}>
                              <List.Item.Meta title={item.time} description={item.prompt}/>
                          </List.Item>
                      )}
                >

                </List>
            </Drawer>
            {/*预览图片*/}
            <div
                className={`absolute inset-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 ${isPreviewImgShow ? "show" : "hidden"}`}
                onClick={closePreviewImg}>
                <img src={previewImgLink} alt={'previewImg'}/>
            </div>
            <div className={`divider m-0.5`}>
            </div>
            <footer className="footer footer-center p-1 text-base-content">
                <aside>
                    <p>Copyright © 2023 - All right reserved </p>
                    <p>made by pyronn</p>
                </aside>
            </footer>
        </main>

    )
}

