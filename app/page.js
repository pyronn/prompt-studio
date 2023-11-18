"use client"
import {useEffect, useState} from 'react'

export default function Home() {

    const [inputKeywords, setInputKeywords] = useState('');
    const [finalKeywords, setFinalKeywords] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [allCategoryPrompts, setAllCategoryPrompts] = useState([]);
    const [notionLoaded, setNotionLoaded] = useState(false);
    const [subCategoryPrompts, setSubCategoryPrompts] = useState({});
    const [categoryDirs, setCategoryDirs] = useState([]); // ["root", "root/child1", "root/child2"

    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [libraryKeywords, setLibraryKeywords] = useState([]);
    const [activeKeywords, setActiveKeywords] = useState([]);

    const [newDictPromptText, setNewDictPromptText] = useState("");
    const [newDictPromptTransText, setNewDictPromptTransText] = useState("");
    const [newDictPromptDir, setNewDictPromptDir] = useState("");

    const [toasts, setToasts] = useState([]);

    const handleInputKeywordsChange = (event) => {
        setInputKeywords(event.target.value);
        setFinalKeywords(event.target.value)
        // TODO: 解析输入的提示词，并设置到detectedKeywords中
    };

    const toggleKeywordSelection = (keyword) => {
        // TODO: 切换中间列表中提示词的选择状态，并更新最终组装的提示词
    };

    const addKeywordToFinal = (keyword) => {
        // TODO: 从提示词库中添加提示词到最终提示词中
    };

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
        const newActKeywords = activeKeywords
        newActKeywords[index] = activeKeywords[index] === 1 ? 0 : 1
        setActiveKeywords(newActKeywords)
        const keywordList = []
        newActKeywords.forEach((val, index) => {
            if (val === 1) {
                keywordList.push(selectedKeywords[index].word)
            }
        })
        const keywordStr = keywordList.join(",")
        setFinalKeywords(keywordStr)
    }

    const parseInputKeywords = (input) => {
        if (input === "") {
            return
        }
        // 分割系统参数和关键词
        const [keywordStr, ...params] = input.split(' --').filter(Boolean);
        console.log(keywordStr)
        const keywordList = keywordStr.split(',').map((kw) => {
            const parts = kw.trim().split(' ::');
            return {word: parts[0].trim(), weight: parts.length > 1 ? parseInt(parts[1], 10) : undefined};
        });

        // 解析系统参数

        const paramsObj = params.map((param) => {
            const val = '--' + param
            keywordList.push({word: val})
            return {word: val};
        });

        const activeIndex = new Array(keywordList.length).fill(1)
        setActiveKeywords(activeIndex);

        setSelectedKeywords(keywordList)

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

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
        if (!notionLoaded) {
            loadAllCategoryKeywords().then(() => {
                setNotionLoaded(true)
            })
        }
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
        const resp = await fetch('/api/dict', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const result = await resp.json()
        result.data.map()
        setAllCategoryPrompts(result.data)
    }

    useEffect(() => {
        parseInputKeywords(inputKeywords);
    }, [inputKeywords]);

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

    return (

        <main className="">
            <div className=" container mx-auto p-4">
                <div className="flex">
                    {/* 输入区域 */}
                    <div className="w-1/3">
                        <div className="bg-gray-800 p-4 rounded-md w-full max-w-2xl mx-auto my-8">
                            <button onClick={(e) => (toggleDrawer())}>Drawer</button>
                            <div className="border-b border-gray-700 pb-2">
                                <h1 className="text-white text-lg font-bold">untitled</h1>
                            </div>
                            <div className="mt-4">
                                <textarea
                                    className="min-h-[8rem] w-full max-w-md resize-none text-green-500 font-mono bg-gray-300 p-2 rounded-t-md"
                                    onChange={handleInputKeywordsChange}
                                    defaultValue={inputKeywords}
                                />
                                <div className="text-white font-mono bg-gray-700 p-2 rounded-b-md">
                                    {finalKeywords}
                                </div>
                            </div>
                            <div>
                                <button className={`btn btn-primary`} onClick={copyToClipboard}>
                                    复制
                                </button>
                                <button className={`btn btn-secondary`} onClick={doTranslate}>
                                    翻译
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 中间提示词列表区域 */}
                    <div className="w-1/3 px-4">
                        <div className="mt-4">
                            {selectedKeywords.filter((kw) => (kw.word !== undefined && kw.word !== "")).map((kw, index) => (
                                <div className={`indicator p-2`}>
                                    <div className="indicator-item indicator-bottom cursor-pointer hover:cursor-pointer"
                                         onClick={() => (saveNewDictPromptDialog(kw))}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={2.5} stroke="red" className="w-3 h-3">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M4.5 12.75l6 6 9-13.5"/>
                                        </svg>
                                    </div>
                                    <div
                                        className={`inline-block rounded-lg cursor-pointer hover:cursor-pointer text-xs`}
                                        onClick={(e) => toggleKeyword(index)} key={index}>
                                        <div
                                            className={`rounded-s-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-green-400" : "bg-gray-300"}`}>
                                            {kw.word}
                                        </div>
                                        <div
                                            className={`${kw.transText === undefined || kw.transText === "" ? "hidden" : "show"} rounded-e-sm inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-blue-400" : "bg-gray-400"}`}>
                                            {kw.transText}
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        <div className={`flex flex-basis-4`}>
                            <button className={`btn btn-sm`}>Notion配置</button>
                            <div className={`absolute right-1/3 w-1/2 top-1/2 border-2 p-2 bg-gray-100 `}>
                                <div>
                                    <label className={`label text-xs`}>
                                        <span className={`label-text`}>是否启用Notion词典:</span>
                                        <input type='checkbox' className={`checkbox checkbox-xs`}/>
                                    </label>

                                </div>
                                <div className={`p-1`}>
                                    <label className={`label text-xs z-20`}>NotionToken:</label>
                                    <input type='text' className={`input input-xs input-bordered`} placeholder={`hello`}/>
                                </div>
                                <div className={`p-1`}>
                                    <label className={`label text-xs`}>NotionToken:</label>
                                    <input type='text' className={`input input-xs input-bordered`} placeholder={`hello`}/>
                                </div>
                                <button className={`btn btn-xs w-full`} onClick={loadAllCategoryKeywords}>
                                    加载
                                </button>
                                <button className={`btn btn-xs w-full`}>
                                    同步默认词典到notion
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`card-body h-256`}>
                        <div className={`join`}>
                            {
                                allCategoryPrompts.map((category, index) => (
                                    <input className={`join-item btn btn-sm text-sm`} type={`radio`} name={`category`}
                                           onClick={onDictCategoryClick} value={index} aria-label={category.name}/>
                                ))
                            }

                        </div>
                        <div>
                            {
                                Object.keys(subCategoryPrompts).map((subCateName, index) => (
                                    <div className={`collapse collapse-arrow collapse-sm border`}>
                                        <input type={"checkbox"}/>
                                        <div className={`collapse-title text-sm font-medium`}>{subCateName}</div>
                                        <div className={`collapse-content`}>
                                            {
                                                subCategoryPrompts[subCateName].map((prompt) => (
                                                    <div
                                                        className={`inline-block p-1 m-0.25 rounded-lg cursor-pointer hover:cursor-pointer text-xs`}
                                                        onClick={(e) => console.log(prompt.text)}>
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

