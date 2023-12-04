"use client"
import {useEffect, useState} from 'react'
import Link from 'next/link';
import {Flex, HoverCard} from '@radix-ui/themes'
import SortableButtonContainer from "@/components/SortableButtonContainer";
import {X} from "lucide-react";


export default function Home() {

    const modelOptions = {
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

    const [isPreviewImgShow, setIsPreviewImgShow] = useState(false)
    const [previewImgLink, setPreviewImgLink] = useState("")

    const [inputKeywords, setInputKeywords] = useState(''); // 输入的关键词
    const [finalKeywords, setFinalKeywords] = useState(''); // 最终的关键词
    const [outputKeywords, setOutputKeywords] = useState(''); // 输出的关键词
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 是否打开抽屉
    const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false); // 是否打开抽屉
    const [allCategoryPrompts, setAllCategoryPrompts] = useState([]); // 所有的提示词
    const [dictCategoryDirs, setDictCategoryDirs] = useState([]); // 词典分类

    const [isPromptDictLoaded, setIsPromptDictLoaded] = useState(false); // 是否已经加载了notion词典
    const [subCategoryPrompts, setSubCategoryPrompts] = useState({}); // 二级分类的提示词
    const [isNotionEnable, setIsNotionEnable] = useState(false); // 是否启用notion词典
    const [notionToken, setNotionToken] = useState(""); // notion token
    const [notionDatabaseId, setNotionDatabaseId] = useState(""); // notion database id
    const [isOnlyNotion, setIsOnlyNotion] = useState(false); // 是否只使用notion词典

    const [prompts, setPrompts] = useState([]); // 所有的提示词
    const [promptsCategories, setPromptsCategories] = useState([]); // 词库分类
    const [curPromptCategory, setCurPromptCategory] = useState("全部"); // 当前的词库分类

    // 系统参数
    const [stylize, setStylize] = useState(100);
    const [model, setModel] = useState("niji5");
    const [style, setStyle] = useState("");
    const [chaos, setChaos] = useState(0);
    const [imageWeight, setImageWeight] = useState(1);
    const [aspect, setAspect] = useState("1:1");


    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [activeKeywords, setActiveKeywords] = useState([]);
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

    const [toasts, setToasts] = useState([]);


    const handleInputKeywordsChange = (event) => {
        setInputKeywords(event.target.value);
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
        setNewDictPromptTransText("")
        setNewDictPromptText("")
        setNewDictPromptDir("")
        let trans = transText === undefined ? "" : transText
        setNewDictPromptTransText(trans)
        setNewDictPromptText(word)
        document.getElementById("dict_prompt_editor").showModal()
    };

    const saveNewDictPrompt = () => {
        if (!isNotionEnable) {
            addToast("请先启用Notion", "warning")
            return
        }
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
            document.getElementById("dict_prompt_editor").close()
            setNewDictPromptTransText("")
            setNewDictPromptText("")
            setNewDictPromptDir("")
            addToast("保存成功", "success", 3000)
        }).catch(err => {
            setNewDictPromptTransText("")
            setNewDictPromptText("")
            setNewDictPromptDir("")
            addToast("保存失败" + err, "error", 3000)
        });

    };

    const saveNewPrompt = () => {
        if (!isNotionEnable) {
            addToast("请先启用Notion", "warning")
            return
        }
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
            document.getElementById("prompt_editor").close()
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            addToast("保存成功", "success", 3000)
        }).catch(err => {
            document.getElementById("prompt_editor").close()
            setNewPromptTitle("")
            setNewPromptDesc("")
            setNewPromptCategory("")
            setNewPromptRawPrompt("")
            setNewPromptSampleImgLink("")
            addToast("保存失败" + err, "error", 3000)
        })

    };

    const toggleKeyword = (index) => {
        const newActKeywords = new Array(...activeKeywords)
        newActKeywords[index] = activeKeywords[index] === 1 ? 0 : 1
        setActiveKeywords(newActKeywords)
    }

    // 解析输入的关键词
    const parseInputKeywords = () => {

        // 分割系统参数和关键词
        const input = inputKeywords.trim();
        const inputKeywordList = []
        const sysParams = {}
        if (inputKeywords !== "") {
            const [keywordStr, ...params] = input.split(' --').filter(Boolean);
            keywordStr.split(',').map((kw, index) => {
                const id = Date.now() + Math.random() * 1000
                const parts = kw.trim().split(' ::');
                if (parts[0].trim() !== "") {
                    inputKeywordList.push({
                        id: id,
                        word: parts[0].trim(),
                        weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined
                    })
                }
            });

            // 解析系统参数
            params.map((param) => {
                const name = param.split(' ')[0]
                const value = param.split(' ')[1]
                let key = name
                if (name === 'niji' || name === 'v') {
                    key = 'model'
                }
                sysParams[key] = {name: name, value: value}
            });
        }
        if (!('model' in sysParams)) {
            const curModel = modelOptions[model]
            sysParams['model'] = {name: curModel.paramName, value: curModel.paramValue}
        }
        const activeIndex = new Array(inputKeywordList.length).fill(1)
        setActiveKeywords(activeIndex);

        setSelectedKeywords(inputKeywordList)
        setSystemParams(sysParams)
        parseSystemParams(sysParams)
    }

    const translateKeywords = async (keywords) => {
        const resp = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider: "tencent",
                srcLang: "en",
                tarLang: "zh",
                textList: keywords
            })
        })
        const data = await resp.json()
        return data.data.targetList
    }

    const doTranslate = async () => {
        const srcTextList = []
        const srcTextObjList = []
        selectedKeywords.map((kw, index) => {
            if (kw.transText === undefined || kw.transText === "") {
                srcTextList.push(kw.word)
                srcTextObjList.push({word: kw.word, index: index})
            }
        })
        const targetTextList = await translateKeywords(srcTextList)
        const newSelectedKeywords = new Array(...selectedKeywords)
        srcTextObjList.map((kwObj) => {
            newSelectedKeywords[kwObj.index].transText = targetTextList[kwObj.index]
        })
        setSelectedKeywords(newSelectedKeywords)
    }

    const copyToClipboard = async () => {
        if ('clipboard' in navigator) {
            try {
                await navigator.clipboard.writeText(finalKeywords);
                addToast("已复制到粘贴板!", "success", 3000)
            } catch (err) {
                addToast("复制失败" + err.message, "error", 3000);
            }
        } else {
            addToast("浏览器不支持复制到粘贴板", "warning", 3000);
        }
    }

    const addKeyword = (dictPrompt) => {
        const newSelected = new Array(...selectedKeywords)
        const id = dictPrompt.id ? dictPrompt.id : Date.now()
        newSelected.push({word: dictPrompt.text, transText: dictPrompt.transText, id: id})
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
            loadPromptAll()
        }
    }

    const loadPromptAll = async () => {
        if (!isNotionEnable) {
            return
        }
        const data = fetch("/api/prompt", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("notionToken"),
                'Notion-Database-Id': localStorage.getItem("notionDatabaseId")
            }
        }).then(res => res.json()).then(res => res.data);
        const result = await data
        const cateSet = new Set()
        result.map((item) => {
            if (item.category !== undefined && item.category !== "其他") {
                cateSet.add(item.category)
            }
        })
        const cateArr = ["全部", ...cateSet.values(), "其他"]
        setPrompts(result)
        setPromptsCategories(cateArr)
    }

    const handleKeywordSortChange = (items, activeItems) => {
        setSelectedKeywords(items)
        setActiveKeywords(activeItems)
    }

    const onDictCategoryClick = (e) => {
        const index = e.target.value
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

    const loadAllCategoryKeywords = async () => {
        if (!isNotionEnable) {
            const resp = await fetch('/api/dict/local', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const result = await resp.json()
            parseAllDictDirs(result.data)
            setAllCategoryPrompts(result.data)
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
        setAllCategoryPrompts(result.data)
    }

    useEffect(() => {
        parseInputKeywords();
    }, [inputKeywords]);

    useEffect(() => {
        parseFinalKeyword();
    }, [activeKeywords, selectedKeywords, systemParams])

    useEffect(() => {
        setIsNotionEnable(localStorage.getItem("enableNotionDict") === "true")
        setNotionToken(localStorage.getItem("notionToken"))
        setNotionDatabaseId(localStorage.getItem("notionDatabaseId"))
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
                keywordList.push(selectedKeywords[index].word)
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
        setOutputKeywords(keywordStr + " " + systemParamStr)
        setFinalKeywords(imaginePrefix + " " + keywordStr + " " + systemParamStr)
    }

    const addToast = (message, type, duration = 5000) => {
        const newToast = {
            id: Date.now(),
            message: message,
            type: type
        }
        setToasts([...toasts, newToast])
        setTimeout(() => {
            setToasts(toasts.filter((t) => (t.id !== newToast.id)))
        }, duration)
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
        const modelOption = modelOptions[model]
        setSystemParams({model: {name: modelOption.paramName, value: modelOption.paramValue}})
    }


    function syncToNotion() {
        addToast("暂不支持同步到notion", "warning", 3000)
    }

    function saveNewPromptDialog() {
        if (!isNotionEnable) {
            addToast("请先启用Notion", "warning")
            return
        }
        setNewPromptTitle("");
        setNewPromptCategory("")
        setNewPromptDesc("")
        setNewPromptSampleImgLink("")
        setNewPromptRawPrompt(outputKeywords)
        document.getElementById("prompt_editor").showModal()
    }

    function usePrompt(rawPrompt) {
        setInputKeywords(rawPrompt)
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

    return (

        <main className="">
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
                                    <span className="font-bold">PromptStudio</span>
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
                            <HoverCard.Root>
                                <HoverCard.Trigger>
                                    <Link href={'#'} className={`flex items-center`}>Notion配置
                                    </Link>
                                </HoverCard.Trigger>
                                <HoverCard.Content>
                                    <Flex gap="4" className={`border-2 p-2 bg-base-100 rounded rounded-5`}>
                                        <div>
                                            <label className={`label text-xs`}>
                                                <span className={`label-text`}>是否启用Notion:</span>
                                                <input type='checkbox' className={`checkbox checkbox-xs`}
                                                       checked={isNotionEnable}
                                                       onChange={onEnableNotionDictChange}/>
                                            </label>

                                        </div>
                                        <div>
                                            <label className={`label text-xs`}>
                                                <span className={`label-text`}>是否只使用notion词典:</span>
                                                <input type='checkbox' className={`checkbox checkbox-xs`}
                                                       checked={isOnlyNotion}
                                                       onChange={onOnlyNotionChange}/>
                                            </label>
                                        </div>
                                        <div className={`p-1`}>
                                            <label className={`label text-xs z-20`}>NotionToken:</label>
                                            <input type='text' className={`input input-xs input-bordered`}
                                                   name={`notionToken`}
                                                   placeholder={`NotionToken`} value={notionToken}
                                                   onChange={onNotionTokenChange} disabled={!isNotionEnable}/>

                                        </div>
                                        <div className={`p-1`}>
                                            <label className={`label text-xs`}>NotionDatabaseID:</label>
                                            <input type='text' className={`input input-xs input-bordered`}
                                                   name={`notionDatabaseId`}
                                                   value={notionDatabaseId}
                                                   placeholder={`NotionDatabaseID`}
                                                   onChange={onNotionDatabaseIdChange} disabled={!isNotionEnable}/>
                                        </div>
                                    </Flex>

                                    {/*</div>*/}
                                </HoverCard.Content>
                            </HoverCard.Root>
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
                                <textarea
                                    className="text-sm min-h-[10rem] w-full resize-none text-black-300 font-mono bg-gray-300 p-2 rounded-t-md bordered"
                                    onChange={handleInputKeywordsChange}
                                    value={inputKeywords}
                                />
                                <div
                                    className="w-full text-sm text-gray-200 font-mono bg-gray-700 p-1.5 rounded-b-md bordered">
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
                                        <select className={`select select-sm  inline-block`}
                                                onChange={(e) => setModel(e.target.value)}
                                                value={model}>
                                            {Object.values(modelOptions).map((modelOption) => (
                                                <option key={modelOption.name}
                                                    // selected={model === modelOption.name}
                                                        value={modelOption.name}>{modelOption.showName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`bordered`}>
                                        <label className={`label text-xs w-1/4 inline-block`}>
                                            <span className={`label-text`}>--ar 图片尺寸:</span>
                                        </label>
                                        <select className={`select select-sm max-w-xs inline-block`}
                                                onChange={(e) => {
                                                    setAspect(e.target.value)
                                                }}
                                                value={aspect}
                                        >
                                            {aspectOptions.map((aspectOption) => (
                                                <option key={aspectOption}
                                                    // selected={aspect === aspectOption}
                                                        value={aspectOption}>{aspectOption}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`bordered`}>
                                        <label className={`label text-xs inline-block w-1/4`}>
                                            <span className={`label-text`}>--s 风格化:</span>
                                        </label>
                                        <input type={`number`} className={`input input-sm inline-block w-24`}
                                               value={stylize} onChange={(e) => {
                                            setStylize(e.target.value)
                                        }}/>
                                        <input type="range" min={0} max={1000} value={stylize} step={10}
                                               className="range range-xs w-1/3" onChange={(e) => {
                                            setStylize(e.target.value)
                                        }}/>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/4`}>
                                            <span className={`label-text`}>--style 风格:</span>
                                        </label>
                                        <input type={`text`} className={`input input-sm inline-block w-1/3`}
                                               value={style} onChange={(e) => {
                                            setStyle(e.target.value)
                                        }}/>
                                        <select className={`select select-sm`} onChange={(e) => {
                                            setStyle(e.target.value)
                                        }}>
                                            {styleOptions.map((styleOption) => (
                                                <option key={styleOption}
                                                        defaultValue={style}
                                                        value={styleOption}>{styleOption}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/4`}>
                                            <span className={`label-text`}>--c 多样性:</span>
                                        </label>
                                        <input type={`text`} className={`input input-sm inline-block w-16`}
                                               value={chaos} onChange={(e) => {
                                            setChaos(e.target.value)
                                        }}/>
                                        <input type="range" min={0} max={100} value={chaos} step={1}
                                               className="range range-xs w-1/3" onChange={(e) => {
                                            setChaos(e.target.value)
                                        }}/>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/4`}>
                                            <span className={`label-text`}>--iw 图片权重:</span>
                                        </label>
                                        <input type={`text`} className={`input input-sm inline-block w-16`}
                                               value={imageWeight} onChange={(e) => {
                                            setImageWeight(e.target.value)
                                        }}/>
                                        <input type="range" min={0} max={2} value={imageWeight} step={0.25}
                                               className="range range-xs w-1/3" onChange={(e) => {
                                            setImageWeight(e.target.value)
                                        }}/>
                                    </div>
                                </div>
                            </div>
                            {/*按钮组*/}
                            <div className={``}>
                                <button className={`btn btn-primary btn-sm m-1`} onClick={copyToClipboard}>
                                    复制
                                </button>
                                <button className={`btn btn-secondary btn-sm m-1`} onClick={doTranslate}>
                                    翻译
                                </button>
                                <button className={`btn btn-error btn-sm m-1`} onClick={clearInput}>
                                    清空
                                </button>
                                <button className={`btn btn-error btn-sm m-1`} onClick={saveNewPromptDialog}>
                                    保存提示词
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 中间提示词列表区域 */}
                    <div className="w-2/5 px-2">
                        <div className="mt-4">
                            <SortableButtonContainer items={selectedKeywords} onItemsChange={handleKeywordSortChange}
                                                     activeKeywords={activeKeywords}
                                                     saveNewDictPromptDialog={saveNewDictPromptDialog}
                                                     toggleKeyword={toggleKeyword}/>
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
                            <button className={`btn btn-sm btn-secondary `} onClick={loadAllCategoryKeywords}>加载
                            </button>
                            <button>
                                <X onClick={(e) => setIsDrawerOpen(false)}></X>
                            </button>
                        </div>

                    </div>

                    <div className={`card-body h-screen `}>
                        {/*一级分类*/}
                        <div className={`join flex flex-wrap`}>
                            {
                                allCategoryPrompts.map((category, index) => (
                                    <input className={`join-item btn btn-sm text-sm rounded-none btn-primary-bg`}
                                           type={`radio`}
                                           name={`category`}
                                           onClick={onDictCategoryClick} value={index} aria-label={category.name}/>
                                ))
                            }
                        </div>
                        {/*二级分类和词典*/}
                        <div className={`overflow-y-auto`}>
                            {
                                Object.keys(subCategoryPrompts).map((subCateName) => (
                                    <div className={`collapse collapse-arrow collapse-sm`}>
                                        <input type={"checkbox"}/>
                                        <div className={`collapse-title text-sm font-medium`}>{subCateName}</div>
                                        <div className={`collapse-content`}>
                                            {
                                                subCategoryPrompts[subCateName].map((prompt) => (
                                                    <div
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
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    {/* 其他组件 */}
                </div>

            </div>
            {/*词典保存对话框*/}
            <dialog id={`dict_prompt_editor`} className={`modal`}>
                <div className={`modal-box`}>
                    <div className={`modal-header`}>
                        <div className={`modal-title`}>保存提示词词典</div>
                    </div>
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div>
                        <div className={`p-1`}>
                            <input type="text" placeholder="提示词原文" className=" m-1 input input-border input-sm"
                                   disabled={true}
                                   name={`text`} value={newDictPromptText} onChange={(e) => {
                                setNewDictPromptText(e.target.value)
                            }}/>
                            <input type="text" placeholder="提示词翻译" className="m-1 input input-border input-sm"
                                   name={`transText`} value={newDictPromptTransText} onChange={(e) => {
                                setNewDictPromptTransText(e.target.value)
                            }}/>
                            <input type="text" placeholder="分类路径" className="m-1 input input-border input-sm"
                                   name={`dir`} value={newDictPromptDir} onChange={(e) => {
                                setNewDictPromptDir(e.target.value)
                            }}/>
                            <select className={`select select-sm max-w-xs inline-block`}
                                    onChange={(e) => {
                                        setNewDictPromptDir(e.target.value)
                                    }}
                                    value={newDictPromptDir}
                            >
                                {dictCategoryDirs.map((item, index) => (
                                    <option key={index}
                                            value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={`modal-footer`}>
                        <button className={`btn btn-sm`} onClick={saveNewDictPrompt}>保存</button>
                    </div>
                </div>
            </dialog>

            {/*词库抽屉*/}
            <div
                // className={`fixed rounded-t-lg inset-y-0 z-50 right-0 w-2/3 h-screen bg-gray-200 transform transition-transform duration-300 ease-in-out
                className={`fixed rounded rounded-t-lg inset-x-0 z-50 bottom-0 w-full  bg-base-200 transform transition-transform duration-300 ease-in-out 
                ${isPromptDrawerOpen ? 'translate-y-0' : 'translate-y-full'} drop-shadow-3xl`}
            >
                {/* 抽屉内容 */}
                <div className="p-2 card h-full">
                    <div className={`p-2 card-title flex text-sm flex-between w-full items-center justify-between`}>
                        <div>
                            <h2>
                                提示词库
                            </h2>
                        </div>

                        <button className={`space-x-1`}>
                            <X onClick={(e) => setIsPromptDrawerOpen(false)}></X>
                        </button>
                    </div>

                    <div className={`card-body p-2 h-full`}>
                        {isNotionEnable ? "" : <div>Notion数据库未启用</div>}
                        <div className={`p-0.5 join flex flex-wrap rounded-xl`}>
                            {
                                promptsCategories.map((category, index) => (
                                    <input className={`join-item btn btn-sm text-sm rounded-none`} type={`radio`}
                                           key={index}
                                           name={`category`}
                                           onClick={(e) => {
                                               setCurPromptCategory(category)
                                           }} value={category} aria-label={category}/>
                                ))
                            }
                        </div>
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
                                            <p className="text-white">{item.desc}</p>
                                        </div>
                                        <div className={"space-x-4 w-full flex justify-end"}>
                                            <button className={`btn btn-xs md:btn-sm btn-secondary `} onClick={(e) => {
                                                usePrompt(item.rawPrompt);
                                                e.stopPropagation();
                                            }}>使用
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
            <div>
                <dialog id={`prompt_editor`} className={`modal`}>
                    <div className={`modal-box w-11/12 max-w-5xl`}>
                        <div className={`modal-header`}>
                            <div className={`modal-title`}>保存提示词</div>
                        </div>
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <div>
                            <div className={`p-1 flex`}>
                                {newPromptSampleImgLink && newPromptSampleImgLink !== "" ?
                                    <img className={`w-48`} src={newPromptSampleImgLink} alt={``}/> :
                                    <div className={`w-48 skeleton`}/>
                                }

                                <div className={`flex flex-col w-1/3`}>
                                    <input type="text" placeholder="提示词标题"
                                           className=" m-1 input input-border input-sm"
                                           name={`text`} value={newPromptTitle} onChange={(e) => {
                                        setNewPromptTitle(e.target.value)
                                    }}/>
                                    <input type="text" placeholder="分类(只支持一级分类)"
                                           className=" m-1 input input-border input-sm"
                                           name={`text`} value={newPromptCategory} onChange={(e) => {
                                        setNewPromptCategory(e.target.value)
                                    }}/>
                                    <input type="text" placeholder="提示词描述"
                                           className="m-1 input input-border input-sm"
                                           name={`transText`} value={newPromptDesc} onChange={(e) => {
                                        setNewPromptDesc(e.target.value)
                                    }}/>
                                    <input type="text" placeholder="示例图片链接"
                                           className="m-1 input input-border input-sm"
                                           name={`sampleImage`} value={newPromptSampleImgLink} onChange={(e) => {
                                        setNewPromptSampleImgLink(e.target.value)
                                    }}/>

                                </div>
                                <div className={`w-2/5`}>
                                    <textarea placeholder="提示词原文"
                                              className="text-sm min-h-[8rem] w-full max-w-md resize-none font-mono p-2 rounded border-red-100"
                                              name={`rawPrompt`} value={newPromptRawPrompt}
                                              onChange={(e) => setNewPromptRawPrompt(e.target.value)}/>
                                    {/*TODO 翻译*/}
                                </div>

                            </div>
                        </div>
                        <div className={`modal-footer`}>
                            <button className={`btn btn-sm`} onClick={saveNewPrompt}>保存</button>
                        </div>
                    </div>
                </dialog>
            </div>

            {/*toast*/}
            <div className={`toast toast-top toast-center`}>
                {toasts.map((toast) => (
                    <div role="alert" className={` alert alert-${toast.type}`}
                         onClick={() => (setToasts(toasts.filter((t) => (t.id !== toast.id))))}>
                        {toast.message}
                    </div>
                ))
                }
            </div>
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

