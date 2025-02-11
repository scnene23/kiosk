"use client"
import React, { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import axios from 'axios';

export default function Country({ label, style, onChange, fieldName }) {

    const [price, setPrice] = useState([]);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await axios.get('/api/v1/prices/priceManagement');
                const filteredData = res.data.response.filter(price => price.raterName !== "");
                setPrice(filteredData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        getData();
    }, []);

    return (
        <div className={style}>
            <Autocomplete
                label={<span style={{ fontSize: '10px' }}>{label}</span>}
                className="max-w-xs text-gray-400"
                variant="underlined"
                onChange={(value) => {
                    onChange(value, fieldName);
                }}
            >
                {price.map((price) => (
                    <AutocompleteItem key={price.rategrpID} value={price} onClick={() => onChange(price, fieldName)}>
                        {price.raterName}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
        </div>
    );
}
