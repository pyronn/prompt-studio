"use client"
import {useEffect, useState} from 'react'

export default function Home() {

    const [inputKeywords, setInputKeywords] = useState('');
    const [finalKeywords, setFinalKeywords] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [libraryKeywords, setLibraryKeywords] = useState([]);
    const [activeKeywords, setActiveKeywords] = useState([]);

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

    const saveNewKeyword = (keyword) => {
        // TODO: 实现保存新提示词的功能，包括分类的处理
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

    useEffect(() => {
        parseInputKeywords(inputKeywords);
    }, [inputKeywords]);

    return (
        <main className="">
            <div className="container mx-auto p-4">
                <div className="flex">
                    {/* 输入区域 */}
                    <div className="w-1/2">
                        <div className="bg-gray-800 p-4 rounded-md w-full max-w-2xl mx-auto my-8">
                            <button onClick={(e)=>(setIsDrawerOpen(!isDrawerOpen))}>Drawer</button>
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
                    <div className="w-1/2 px-4">
                        <div className="mt-4">
                            {selectedKeywords.filter((kw)=>(kw.word !== undefined && kw.word !== "")).map((kw, index) => (
                                <div className={`indicator`}>
                                    <div className="indicator-item indicator-bottom" onClick={()=>(console.log("save"))}>
                                        <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 rounded">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <div
                                        className={`inline-block p-1 m-0.25 rounded-lg cursor-pointer hover:cursor-pointer text-xs`}
                                        onClick={(e) => toggleKeyword(index)} key={index}>
                                        <div
                                            className={`rounded-s-lg inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-green-400" : "bg-gray-300"}`}>
                                            {kw.word}
                                        </div>
                                        <div
                                            className={`${kw.transText === undefined || kw.transText === "" ? "hidden" : "show"} rounded-e-lg inline-block p-1 text-white ${activeKeywords[index] === 1 ? "bg-blue-400" : "bg-gray-400"}`}>
                                            {kw.transText}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={`flex`}>
                    {/* 底部提示词库区域 */}
                    <div className="">
                        library-dic
                        {libraryKeywords.map((keyword, index) => (
                            <p key={index} className="cursor-pointer" onClick={() => addKeywordToFinal(keyword)}>
                                {keyword}
                            </p>
                        ))}
                    </div>


                </div>
            </div>
            <div
                className={`fixed rounded-t-lg bottom-0 left-0 w-full h-256 bg-gray-200 overflow-hidden transition-transform duration-300 transform ${
                    isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                {/* 抽屉内容 */}
                <div className="p-4">
                    <h1>抽屉内容</h1>
                    {/* 其他组件 */}
                </div>
            </div>
        </main>
    )
}

