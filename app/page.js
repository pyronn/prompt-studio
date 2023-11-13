"use client"
import {useEffect, useState} from 'react'

export default function Home() {

    const [inputKeywords, setInputKeywords] = useState('');
    const [finalKeywords, setFinalKeywords] = useState('');

    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [libraryKeywords, setLibraryKeywords] = useState([]);
    const [activeKeywords, setActiveKeywords] = useState(new Set());

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

    const toggleKeyword = (word) => {
        const newActKeywords = new Set(activeKeywords)
        if (newActKeywords.has(word)){
            newActKeywords.delete(word)
        }else{
            newActKeywords.add(word)
        }
        setActiveKeywords(newActKeywords)
        const tmpArr = [...newActKeywords]
        const keywordStr = tmpArr.join(",")
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
            const val = '--'+param
            keywordList.push({word: val})
            return {word:val};
        });

        setActiveKeywords(new Set(keywordList.map(kw => kw.word)));

        setSelectedKeywords(keywordList)

    }

    const copyToClipboard = async ()=>{
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
                            </div>
                        </div>
                    </div>

                    {/* 中间提示词列表区域 */}
                    <div className="w-1/2 px-4">
                        <div className="mt-4">
                            {selectedKeywords.map((kw, index) => (
                                <div className={`inline-block p-1 m-1 cursor-pointer hover:cursor-pointer`} onClick={(e)=>toggleKeyword(kw.word)} key={index}>
                                    <div className={`inline-block rounded-l-2 p-1 text-white ${activeKeywords.has(kw.word)?"bg-green-400":"bg-gray-300"}`}>
                                        {kw.word}
                                    </div>
                                    <div className={`inline-block rounded-r-2 p-1 text-white ${activeKeywords.has(kw.word)?"bg-blue-400":"bg-gray-400"}`}>
                                        翻译
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
        </main>
    )
}

