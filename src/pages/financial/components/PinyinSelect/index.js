import React from 'react';
import { Select } from 'antd';
import pinyin from './pinyin.js';
const Option = Select.Option;

export default function InputSelect(props) {
  const onFilter = (searchText, { props: { value, children: text } }) => {
    text = text.trim().toLowerCase();
    searchText = searchText.trim().toLowerCase();
    return [
      text,
      pinyin.toPinYin(text).toLowerCase(),
      pinyin.toPinYinFull(text).toLowerCase()
    ].find((a) => a.includes(searchText));
  };

  let { placeholder, options, value, onChange } = props;

  return (
    <Select
      showSearch
      style={{ width: 300 }}
      placeholder={placeholder}
      optionFilterProp="children"
      onChange={onChange}
      value={value}
      filterOption={onFilter}>
      {options.map(({ value, name, code }) => (
        <Option value={value} key={value}>
          {name}
        </Option>
      ))}
    </Select>
  );
}
