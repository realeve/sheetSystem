import React from 'react';
import { Select } from 'antd';
import styles from './inv.less';

import pinyin from '../../../utils/pinyin.js';
const Option = Select.Option;

export default function InputSelect(props) {
  const onFilter = (searchText, { props: { value, children: text } }) => {
    text = text.trim().toLowerCase();
    searchText = searchText.trim().toLowerCase();
    return [
      text,
      pinyin.toPinYin(text).toLowerCase(),
      pinyin.toPinYinFull(text).toLowerCase()
    ].find(a => a.includes(searchText));
  };

  let { placeholder, options, value, onChange } = props;

  return (
    <Select
      showSearch
      className={styles.formContainer}
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
