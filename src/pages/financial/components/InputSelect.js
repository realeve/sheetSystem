import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import styles from './inv.less';
import * as db from '../services/db';
import debounce from 'lodash/debounce';
import classNames from 'classnames';

const Option = Select.Option;

export default class InputSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      value: props.value || '',
      orgid: props.orgid || '',
      src: []
    };
    this.onSearch = debounce(this.onSearch, 500);
  }

  onChange = (value) => {
    this.props.onChange(value);
  };

  onSearch = async (value = '') => {
    if (this.state.fetching || value.length < 2) {
      return;
    }
    this.setState({ src: [], fetching: true });
    let { fetchingMethod, callback } = this.props;
    let params =
      fetchingMethod === 'getMsn'
        ? { orgid: this.state.orgid, q1: value, q2: value }
        : { q: value };
    let { data } = await db[fetchingMethod](params);
    this.setState({ src: callback(data), fetching: false });
  };

  render() {
    const { fetching, src, value } = this.state;

    const options = src.map(({ value, text }) => (
      <Option key={value}>{text}</Option>
    ));

    let { label, placeholder, required } = this.props;

    return (
      <div className={classNames(styles.formItem, styles.formAction)}>
        <label
          className={classNames(
            styles.formLabel,
            required ? styles.required : ''
          )}>
          {label}
        </label>
        <Select
          showSearch
          value={value}
          placeholder={placeholder}
          style={{ width: 300 }}
          defaultActiveFirstOption={false}
          filterOption={false}
          onSearch={this.onSearch}
          onChange={this.onChange}
          notFoundContent={fetching ? <Spin size="small" /> : null}>
          {options}
        </Select>
      </div>
    );
  }
}
