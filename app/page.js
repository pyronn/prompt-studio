"use client"
import {useEffect, useState} from 'react'
import Link from 'next/link';
import {Flex, HoverCard} from '@radix-ui/themes'
import SortableButtonContainer from "@/components/SortableButtonContainer";


export default function Home() {


    const [inputKeywords, setInputKeywords] = useState(''); // 输入的关键词
    const [finalKeywords, setFinalKeywords] = useState(''); // 最终的关键词
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // 是否打开抽屉
    const [allCategoryPrompts, setAllCategoryPrompts] = useState([]); // 所有的提示词
    const [notionLoaded, setNotionLoaded] = useState(false); // 是否已经加载了notion词典
    const [subCategoryPrompts, setSubCategoryPrompts] = useState({}); // 二级分类的提示词
    const [isNotionEnable, setIsNotionEnable] = useState(false); // 是否启用notion词典
    const [notionToken, setNotionToken] = useState(""); // notion token
    const [notionDatabaseId, setNotionDatabaseId] = useState(""); // notion database id

    // 系统参数
    const [stylize, setStylize] = useState(100);
    const [model, setModel] = useState("niji5");
    const [style, setStyle] = useState("");
    const [chaos, setChaos] = useState(0);
    const [imageWeight, setImageWeight] = useState(0.25);
    const [aspect, setAspect] = useState("1:1");


    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [activeKeywords, setActiveKeywords] = useState([]);
    const [systemParams, setSystemParams] = useState({});

    const [newDictPromptText, setNewDictPromptText] = useState("");
    const [newDictPromptTransText, setNewDictPromptTransText] = useState("");
    const [newDictPromptDir, setNewDictPromptDir] = useState("");

    const [toasts, setToasts] = useState([]);

    const modelOptions = [
        {name: "v5.2", paramName: "v", paramValue: "5.2", showName: "V 5.2"},
        {name: "niji5", paramName: "niji", paramValue: "5", showName: "Niji 5"},
        {name: "v5.1", paramName: "v", paramValue: "5.1", showName: "V 5.1"},
        {name: "v5", paramName: "v", paramValue: "5", showName: "V 5"},
        {name: "v4", paramName: "v", paramValue: "4", showName: "V 4"},
        {name: "v3", paramName: "v", paramValue: "3", showName: "V 3"},
        {name: "niji4", paramName: "niji", paramValue: "4", showName: "Niji 4"},
    ]
    const aspectOptions = ["1:1", "4:3", "16:9", "3:4", "9:16", "3:2", "2:3", "2:1", "1:2"]

    const styleOptions = ["raw", "cute", "expressive", "original", "scenic"]

    const handleInputKeywordsChange = (event) => {
        setInputKeywords(event.target.value);
        setFinalKeywords(event.target.value)
        // TODO: 解析输入的提示词，并设置到detectedKeywords中
    };

    const onEnableNotionDictChange = (e) => {
        setIsNotionEnable(e.target.checked)
        localStorage.setItem("enableNotionDict", e.target.checked)
    }

    const onNotionTokenChange = (e) => {
        setNotionToken(e.target.value)
        localStorage.setItem("notionToken", e.target.value)
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
        const resp = fetch("api/dict", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
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
        })

    };

    const toggleKeyword = (index) => {
        console.log(index);
        const newActKeywords = new Array(...activeKeywords)
        newActKeywords[index] = activeKeywords[index] === 1 ? 0 : 1
        setActiveKeywords(newActKeywords)
    }

    // 解析输入的关键词
    const parseInputKeywords = () => {
        if (inputKeywords === "") {
            return
        }
        // 分割系统参数和关键词
        const input = inputKeywords.trim();
        const [keywordStr, ...params] = input.split(' --').filter(Boolean);
        console.log(keywordStr, params)
        const inputKeywordList = []
        keywordStr.split(',').map((kw, index) => {
            const parts = kw.trim().split(' ::');
            if (parts[0].trim() !== "") {
                inputKeywordList.push({
                    id: index,
                    word: parts[0].trim(),
                    weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined
                })
            }
        });

        // 解析系统参数

        const sysParams = {}
        params.map((param) => {
            const name = param.split(' ')[0]
            const value = param.split(' ')[1]
            console.log(name, value)
            let key = name
            if (name === 'niji' || name === 'v') {
                key = 'model'
            }
            sysParams[key] = {name: name, value: value}
        });

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
                alert('Text copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        } else {
            console.warn('Clipboard API not available.');
        }
    }

    const addKeyword = (dictPrompt) => {
        const newSelected = new Array(...selectedKeywords)
        newSelected.push({word: dictPrompt.text, transText: dictPrompt.transText})
        setSelectedKeywords(newSelected)

        const newActive = new Array(...activeKeywords)
        newActive.push(1)
        setActiveKeywords(newActive)
    }

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
        if (!notionLoaded) {
            loadAllCategoryKeywords().then(() => {
                setNotionLoaded(true)
            })
        }
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

    const loadAllCategoryKeywords = async () => {
        if (!isNotionEnable) {
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
        console.log(result.data)
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
            switch (key) {
                case "s":
                case "stylize":
                    if (systemParams[key].value === 100) {
                        return ""
                    }
                    return `--s ${systemParams[key].value ? systemParams[key].value : ""}`
                case "style":
                    return `--style ${systemParams[key].value ? systemParams[key].value : ""}`
                case "c":
                case "chaos":
                    return `--c ${systemParams[key].value ? systemParams[key].value : ""}`
                case "iw":
                    if (systemParams[key].value === 1) {
                        return ""
                    }
                    return `--iw ${systemParams[key].value ? systemParams[key].value : ""}`
                case "ar":
                case "aspect":
                    return `--ar ${systemParams[key].value ? systemParams[key].value : ""}`
                case "model":
                    return `--${systemParams[key].name} ${systemParams[key].value ? systemParams[key].value : ""}`
                case "tile":
                    return `--tile`
                default:
                    return ""
            }
        }).join(" ")
        setFinalKeywords(keywordStr + " " + systemParamStr)
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

        modelOptions.map((modelOption) => {
            if (modelOption.name === model) {
                newObj["model"] = {name: modelOption.paramName, value: modelOption.paramValue}
            }
        })

        if (style !== "") {
            newObj["style"] = {name: "style", value: style}
        }

        if (aspect !== "1:1") {
            newObj["ar"] = {name: "ar", value: aspect}
        }

        if (stylize !== 100) {
            newObj["s"] = {name: "s", value: stylize}
        }

        if (chaos !== 0) {
            newObj["c"] = {name: "c", value: chaos}
        }

        if (imageWeight !== 0.25) {
            newObj["iw"] = {name: "iw", value: imageWeight}
        }

        setSystemParams(newObj)
    }

    function clearInput() {
        setInputKeywords("")
        setFinalKeywords("")
        setSelectedKeywords([])
        setActiveKeywords([])
        setSystemParams({})
    }

    return (

        <main className="">
            <nav className="bg-white text-gray-500 shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between">
                        <div className="flex space-x-4">
                            {/* Logo */}
                            <div>
                                <Link href="/" className={"flex items-center py-5 px-2 text-white"}>
                                    <span className="font-bold">网站Logo</span>
                                </Link>
                            </div>


                            {/* Primary Nav */}
                            <div className="hidden md:flex  space-x-1 align-end">
                                <button className="py-5 px-3" onClick={toggleDrawer}>
                                    提示词典
                                </button>
                            </div>
                        </div>

                        {/*/!* Mobile Button *!/*/}
                        {/*<div className="md:hidden flex items-center">*/}
                        {/*    <button className="mobile-menu-button">*/}
                        {/*        <MenuIcon className="w-6 h-6" />*/}
                        {/*    </button>*/}
                        {/*</div>*/}
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
            <div className="container mx-auto p-4">
                <div className="flex">
                    {/* 输入区域 */}
                    <div className="w-2/5">
                        <div className="bg-gray-100 p-4 rounded-md w-full max-w-2xl mx-auto my-8">
                            <div className="border-b border-gray-300 pb-2">
                                <h1 className="text-black text-lg font-bold">Prompt</h1>
                            </div>
                            <div className="mt-4">
                                <textarea
                                    className="min-h-[12rem] w-full max-w-md resize-none text-black-300 font-mono bg-gray-300 p-2 rounded-t-md bordered"
                                    onChange={handleInputKeywordsChange}
                                    defaultValue={inputKeywords}
                                />
                                <div className="text-gray-200 font-mono bg-gray-700 p-2 rounded-b-md bordered max-w-md">
                                    {finalKeywords}
                                </div>
                            </div>
                            <div className={'divider'}></div>
                            {/* 系统参数*/}
                            <div>
                                <div className={`p-1`}>
                                    <label className={`label text-xs`}>
                                        <span className={`label-text`}>系统参数:</span>
                                    </label>
                                </div>
                                <div className={`p-1`}>
                                    <div className={`bordered p-1`}>
                                        <label className={`label text-xs w-1/3 inline-block`}>
                                            <span className={`label-text`}>模型:</span>
                                        </label>
                                        <select className={`select select-sm w-1/3 inline-block`}
                                                onChange={(e) => setModel(e.target.value)}>
                                            {modelOptions.map((modelOption) => (
                                                <option key={modelOption.name}
                                                        defaultValue={model}
                                                        value={modelOption.name}>{modelOption.showName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`bordered`}>
                                        <label className={`label text-xs w-1/3 inline-block`}>
                                            <span className={`label-text`}>--ar 图片尺寸:</span>
                                        </label>
                                        <select className={`select select-sm w-1/2 max-w-xs inline-block`}
                                                onChange={(e) => {
                                                    setAspect(e.target.value)
                                                }}>
                                            {aspectOptions.map((aspectOption) => (
                                                <option key={aspectOption}
                                                        defaultValue={aspect}
                                                        value={aspectOption}>{aspectOption}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`bordered`}>
                                        <label className={`label text-xs inline-block w-1/3`}>
                                            <span className={`label-text`}>--s 风格化:</span>
                                        </label>
                                        <input type={`number`} className={`input input-xs inline-block w-1/4`}
                                               value={stylize} onChange={(e) => {
                                            setStylize(e.target.value)
                                        }}/>
                                        <input type="range" min={0} max={1000} value={stylize} step={10}
                                               className="range range-xs w-1/3" onChange={(e) => {
                                            setStylize(e.target.value)
                                        }}/>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/3`}>
                                            <span className={`label-text`}>--style 风格:</span>
                                        </label>
                                        <input type={`text`} className={`input input-xs inline-block w-1/3`}
                                               value={style} onChange={(e) => {
                                            setStyle(e.target.value)
                                        }}/>
                                        <select className={`select select-sm`} onChange={(e) => {
                                            setStyle(e.target.value)
                                        }}>
                                            {styleOptions.map((styleOption) => (
                                                <option key={styleOption}
                                                        selected={styleOption === style}
                                                        value={styleOption}>{styleOption}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/3`}>
                                            <span className={`label-text`}>--c 多样性:</span>
                                        </label>
                                        <input type={`text`} className={`input input-xs inline-block w-1/4`}
                                               value={chaos} onChange={(e) => {
                                            setChaos(e.target.value)
                                        }}/>
                                        <input type="range" min={0} max={100} value={chaos} step={1}
                                               className="range range-xs w-1/3" onChange={(e) => {
                                            setChaos(e.target.value)
                                        }}/>
                                    </div>
                                    <div>
                                        <label className={`label text-xs inline-block w-1/3`}>
                                            <span className={`label-text`}>--iw 图片权重:</span>
                                        </label>
                                        <input type={`text`} className={`input input-xs inline-block w-1/4`}
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
                            <div className={`p-2`}>
                                <button className={`btn btn-primary btn-sm`} onClick={copyToClipboard}>
                                    复制
                                </button>
                                <button className={`btn btn-secondary btn-sm`} onClick={doTranslate}>
                                    翻译
                                </button>
                                <button className={`btn btn-secondary btn-sm`} onClick={clearInput}>
                                    清空
                                </button>
                            </div>
                            <div>
                                <HoverCard.Root>
                                    <HoverCard.Trigger>
                                        <Link href={'#'} className={`btn btn-sm`}>Notion配置
                                        </Link>
                                    </HoverCard.Trigger>
                                    <HoverCard.Content>
                                        {/*<div*/}
                                        {/*    // className={`absolute right-1/3 w-1/2 top-1/3 border-2 p-2 bg-gray-100 ${isNotionConfigHover ? "show" : "hidden"}`}*/}
                                        {/*    onMouseEnter={() => setIsNotionConfigHover(true)}*/}
                                        {/*    onMouseLeave={() => setIsNotionConfigHover(false)}>*/}
                                        <Flex gap="4" className={`border-2 p-2 bg-gray-100`}>
                                            <div>
                                                <label className={`label text-xs`}>
                                                    <span className={`label-text`}>是否启用Notion词典:</span>
                                                    <input type='checkbox' className={`checkbox checkbox-xs`}
                                                           checked={isNotionEnable}
                                                           onChange={onEnableNotionDictChange}/>
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
                                            <button className={`btn btn-xs w-full`} onClick={loadAllCategoryKeywords}>
                                                加载
                                            </button>
                                            <button className={`btn btn-xs w-full`}>
                                                同步默认词典到notion
                                            </button>
                                        </Flex>

                                        {/*</div>*/}
                                    </HoverCard.Content>
                                </HoverCard.Root>
                            </div>
                        </div>
                    </div>

                    {/* 中间提示词列表区域 */}
                    <div className="w-2/5 px-4">
                        <div className="mt-4">
                            <SortableButtonContainer items={selectedKeywords} onItemsChange={handleKeywordSortChange}
                                                     activeKeywords={activeKeywords}
                                                     saveNewDictPromptDialog={saveNewDictPromptDialog}
                                                     toggleKeyword={toggleKeyword}/>
                        </div>

                    </div>
                </div>


            </div>

            {/*抽屉*/}
            <div
                className={`fixed rounded-t-lg inset-y-0 z-50 right-0 w-1/3 h-screen bg-gray-200 transform transition-transform duration-300 ease-in-out 
                ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} bg-white shadow-lg`}
            >
                {/* 抽屉内容 */}
                <div className="p-4 card">
                    <div className={`card-title flex w-max text-sm`}>
                        <div className={`flex flex-basis-1`}>提示词词典</div>
                        <button className={`btn btn-sm `} onClick={loadAllCategoryKeywords}>刷新</button>
                    </div>

                    <div className={`card-body h-256`}>
                        {/*一级分类*/}
                        <div className={`join flex flex-wrap`}>
                            {
                                allCategoryPrompts.map((category, index) => (
                                    <input className={`join-item btn btn-sm text-sm rounded-none`} type={`radio`}
                                           name={`category`}
                                           onClick={onDictCategoryClick} value={index} aria-label={category.name}/>
                                ))
                            }
                        </div>
                        {/*二级分类和词典*/}
                        <div>
                            {
                                Object.keys(subCategoryPrompts).map((subCateName, index) => (
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
                                                            className={`rounded-s-lg inline-block p-1 text-white bg-green-300`}>
                                                            {prompt.text}
                                                        </div>
                                                        <div
                                                            className={`${prompt.transText === undefined || prompt.transText === "" ? "hidden" : "show"} rounded-e-lg inline-block p-1 text-white bg-blue-300`}>
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

                <dialog id={`dict_prompt_editor`} className={`modal`}>
                    <div className={`modal-box`}>
                        <div className={`modal-header`}>
                            <div className={`modal-title`}>保存提示词</div>
                        </div>
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <div>
                            <div className={`p-1`}>
                                <input type="text" placeholder="提示词原文" className=" m-1 input input-border input-sm"
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
                            </div>
                        </div>
                        <div className={`modal-footer`}>
                            <button className={`btn btn-sm`} onClick={saveNewDictPrompt}>保存</button>
                        </div>
                    </div>
                </dialog>
            </div>

            {/*toast*/}
            <div className={`toast toast-top toast-center`}>
                {toasts.map((toast) => (
                    <div className={`text-white alert alert-${toast.type}`}
                         onClick={() => (setToasts(toasts.filter((t) => (t.id !== toast.id))))}>
                        {toast.message}
                    </div>
                ))
                }
            </div>
        </main>

    )
}

