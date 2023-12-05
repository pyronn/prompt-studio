"use client"
import React, {useState} from 'react';
import {AutoComplete, Input} from 'antd';


const PromptAutoInput = ({items, onInputPrompt}) => {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const handleSearch = (value) => {
        setOptions(value ? searchResult(value, items) : []);
    };
    const onSelect = (value, option) => {
        setSelectedItem(option)
        setInputValue(value)
    };
    const onChange = (value) => {
        setInputValue(value)
    }
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            if (inputValue === "" && selectedItem === null) {
                return
            }
            if (selectedItem) {
                onInputPrompt(selectedItem.item)
            } else {
                onInputPrompt(inputValue)
            }
            setInputValue("")
            setSelectedItem(null)
        }
    }


    const searchResult = (query, items) => {
        const fItems = items.filter((item) => {
            return item.text.includes(query) || item.transText.includes(query)
        })

        return fItems.map(item => {
            return {
                item: item,
                value: item.text,
                label: (
                    <div key={item.id}
                         style={{
                             display: 'flex',
                             justifyContent: 'space-between',
                         }}
                    >
                        <span>{item.text}|{item.transText}</span><span>{item.dir}</span>
                    </div>
                )
            }
        })

    }

    return (
        <AutoComplete
            // popupMatchSelectWidth={252}
            className={"w-full"}
            options={options}
            value={inputValue}
            onSelect={onSelect}
            onSearch={handleSearch}
            onChange={onChange}
            onKeyUp={handleEnter}

        >
            <Input.Search size="large"  placeholder="input prompt here, press enter to add prompt" enterButton/>
        </AutoComplete>
    );
};
export default PromptAutoInput;