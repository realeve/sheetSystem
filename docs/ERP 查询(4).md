# ERP 查询

## 数据库连接

> 数据库连接 1：ERP  
> 账户：guest/welcome  
> SID：PROD  
> PORT: 1900

> 数据库连接 2：10.8.2.188（临时，测试通过后迁移至正式环境）  
> 账户：mac2/mac3  
> SID：BPAUTO  
> PORT：1521

## 收付存报表

### 查询当前财务年的具体期间内所有物料的收付存情况

> 截止 2017-12-31 日前物料结存为 0 的物料不显示。

1.  根据用户输入的期间名称`02-18`，查询出当期 max(period_id)，数据库连接 1
    http://10.8.1.25:100/api/150/bc2e7d3404.html?period=02-18

    `select max(period_id) "periodid" from inv.org_acct_periods where period_name='02-18'`

2.  根据用户输入的期间名称`02-18`，查询出上期`01-18` max(period_id)，数据库连接 1
    http://10.8.1.25:100/api/150/bc2e7d3404.html?period=01-18

    `select max(period_id) "periodid" from inv.org_acct_periods where period_name='01-18'`

3.  接口 1(数据库连接 2)： 根据期间 ID，查询物料期初数量、金额（没有子库信息）
    http://10.8.1.25:100/api/151/f0d7f4eab9.html?periodid=3796&sn=%254101%25&name=%25五金%25

    ```sql
    SELECT SN "sn", NAME "name", SUM(QUANTITY) "quantity", ROUND(SUM(FIGURE), 2) "figure", '' "remark", '0' "type"  FROM TBERP_INV_PERIOD
       WHERE MAX_ID <= 3851 			-- 此处替换 期间ID
       AND (QUANTITY > 0 OR FIGURE > 0)
    GROUP BY SN, NAME;
    ```

4.  接口 2(数据库连接 2)：根据期间 ID，查询物料结存数量、金额（包含子库信息）
    http://10.8.1.25:100/api/151/f0d7f4eab9.html?periodid=3796&sn=%254101%25&name=%25五金%25

    ```sql
    SELECT SN "sn", NAME "name", SUM(QUANTITY) "quantity", ROUND(SUM(FIGURE), 2) "figure", DESCRIPTION "remark", '3' "type" FROM TBERP_INV_PERIOD
       WHERE MAX_ID <= 3851 			-- 此处替换 期间ID
       AND (QUANTITY > 0 OR FIGURE > 0)
    GROUP BY SN, NAME, DESCRIPTION;
    ```

5.  接口 3(数据库连接 2)：根据期间 ID，查询物料收入数量、金额，事务 ID、名称
    http://10.8.1.25:100/api/151/f0d7f4eab9.html?periodid=3796&sn=%254101%25&name=%25五金%25

    ```sql
    SELECT t.SN "sn", t.NAME "name", SUM(t.QUANTITY) "quantity", SUM(t.figure) "figure", t.TRANSACTION_TYPE_NAME "remark", '1' TYPE
    FROM TBERP_INV_INCOME t
    WHERE t.MAX_ID <= 3851				--此处替换 期间ID
    --AND t.INVENTORY_ITEM_ID = 4
    GROUP BY t.SN, t.NAME, t.TRANSACTION_TYPE_NAME;
    ```

6.  接口 4(数据库连接 2)：根据前期间 ID，查询物料付出数量、金额，账户别名
    http://10.8.1.25:100/api/151/f0d7f4eab9.html?periodid=3796&sn=%254101%25&name=%25五金%25

    ```sql
    SELECT t.SN "sn", t.NAME "name", SUM(t.QUANTITY) "quantity", SUM(t.figure) "figure", t.DESCRIPTION "remark", '2' "type"
    FROM TBERP_INV_PAYOUT t
    WHERE t.MAX_ID <= 3851				--此处替换 期间ID
    --AND t.INVENTORY_ITEM_ID = 4
    GROUP BY t.SN, t.NAME, t.DESCRIPTION;
    ```

7.  接口 5（数据库连接 1）：ERP 主组织代码
    http://10.8.1.25:100/api/157/5f830d1833.html

## 呆滞库存分析

查询距今时间段（1-2，2-3，3-4，4-5，5 以上）的库存信息

1.  根据用户选择的时间段，计算出时间段的起止日期（比如 start_date, end_date）

2.  根据起止日期，查询物料最后一次事务处理的信息
    periodid 为当前时间最后一次 id 信息，
    http://10.8.1.25:100/api/155/117dd652a7/array.html?from=4&to=5&periodid=3796

                ```sql
                SELECT
        a.sn,a.name,a.account,a.quantity,a.figure,a.source,b.remain_figure,b.remain_quantity,b.remain_remark,a.duration

    FROM
    (
    SELECT
    T .sn ,
    T . NAME ,
    T .transaction_type_name source,
    T .quantity ,
    T .figure ,
    T .description account,
    ROUND (
    (SYSDATE - T .CREATION_DATE) / 365,
    2
    ) duration
    FROM
    TBERP_LAST_TRANSACTION T
    WHERE
    (SYSDATE - T .CREATION_DATE) / 365 BETWEEN 2
    AND 3
    ) A
    LEFT JOIN (
    SELECT
    SN remain_sn,
    SUM (QUANTITY) remain_quantity,
    ROUND (SUM(FIGURE), 2) remain_figure,
    DESCRIPTION remain_remark
    FROM
    TBERP_INV_PERIOD
    WHERE
    MAX_ID <= 3796
    AND (QUANTITY > 0 OR FIGURE > 0)
    GROUP BY
    SN,
    NAME,
    DESCRIPTION
    ) b ON A .sn = b.remain_sn where nvl(b.remain_quantity,0)>0

        ```

3.  根据起止日期，查询物料的结存数量、金额、子库，同前接口 3

# 收付存 20180705

http://10.8.1.25:100/api/156/4653126720.html?baseid=3700&periodid=3796&sn=%254101%25&name=%25%E4%BA%94%E9%87%91%25

```sql
with tmp_tbl as (select 3796 as m_id,3722 as base_id,'%4101%' m_sn,'%%' as m_name from dual)
SELECT
	SN "sn",
	NAME "name",
	SUM (QUANTITY) "quantity",
	ROUND (SUM(FIGURE), 2) "figure",
	'' "remark",
	'0' "type"
FROM
	TBERP_INV_PERIOD a inner join tmp_tbl b
on
	MAX_ID <= b.base_id
AND (QUANTITY > 0 OR FIGURE > 0)
AND sn LIKE b.m_sn
AND NAME LIKE b.m_name
GROUP BY
	SN,
	NAME
union
SELECT
	T .SN "sn",
	T . NAME "name",
	SUM (T .QUANTITY) "quantity",
	SUM (T .figure) "figure",
	T .TRANSACTION_TYPE_NAME "remark",
	'1' "type"
FROM
	TBERP_INV_INCOME T inner join tmp_tbl b
on
	MAX_ID <= b.m_id
AND sn LIKE b.m_sn
AND NAME LIKE b.m_name
GROUP BY
	T .SN,
	T . NAME,
	T .TRANSACTION_TYPE_NAME
union
SELECT
	T .SN "sn",
	T . NAME "name",
	SUM (T .QUANTITY) "quantity",
	SUM (T .figure) "figure",
	T .DESCRIPTION "remark",
	'2' "type"
FROM
	TBERP_INV_PAYOUT T inner join tmp_tbl b
on
	MAX_ID <= b.m_id
AND sn LIKE b.m_sn
AND NAME LIKE b.m_name
GROUP BY
	T .SN,
	T . NAME,
	T .DESCRIPTION
union
SELECT
	SN "sn",
	NAME "name",
	SUM (QUANTITY) "quantity",
	ROUND (SUM(FIGURE), 2) "figure",
	DESCRIPTION "remark",
	'3' "type"
FROM
	TBERP_INV_PERIOD inner join tmp_tbl b
on
	MAX_ID <= b.m_id
AND sn LIKE b.m_sn
AND NAME LIKE b.m_name
AND (QUANTITY > 0 OR FIGURE > 0)
GROUP BY
	SN,
	NAME,
	DESCRIPTION
```

# 组织代码列表

http://10.8.1.25:100/api/157/5f830d1833.html

```sql
select t.ORGANIZATION_ID "value",t.ORGANIZATION_CODE "code",t.ORGANIZATION_NAME "name" from APPS.ORG_ORGANIZATION_DEFINITIONS t where (t.DISABLE_DATE is null or t.DISABLE_DATE>sysdate) and t.INVENTORY_ENABLED_FLAG='Y'
```
