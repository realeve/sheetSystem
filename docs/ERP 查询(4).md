# ERP 查询

## 数据库连接
> 数据库连接1：ERP  
> 账户：guest/welcome   
> SID：PROD     
> PORT: 1900

> 数据库连接2：10.8.2.188（临时，测试通过后迁移至正式环境）     
> 账户：mac2/mac3       
> SID：BPAUTO       
> PORT：1521 

## 收付存报表

### 查询当前财务年的具体期间内所有物料的收付存情况

> 截止2017-12-31日前物料结存为0的物料不显示。

1. 根据用户输入的期间名称`02-18`，查询出当期 max(period_id)，数据库连接1
http://10.8.1.25:100/api/150/bc2e7d3404.html?period=02-18

   `select max(period_id) from inv.org_acct_periods where period_name='02-18' `

2. 根据用户输入的期间名称`02-18`，查询出上期 max(period_id)，数据库连接1
http://10.8.1.25:100/api/150/bc2e7d3404.html?period=02-18

   `select max(period_id) from inv.org_acct_periods where period_name='01-18'`

3. 接口1(数据库连接2)： 根据期间ID，查询物料结存数量、金额（没有子库信息）
http://10.8.1.25:100/api/151/f0d7f4eab9.html?periodid=3829

   ```sql
   SELECT SN, NAME, SUM(QUANTITY) QUANTITY, ROUND(SUM(FIGURE), 2) FIGURE, '' REMARK, '0' TYPE  FROM TBERP_INV_PERIOD 
      WHERE MAX_ID <= 3851 			-- 此处替换 期间ID
      AND (QUANTITY > 0 OR FIGURE > 0)
   GROUP BY SN, NAME;
   ```

4. 接口2(数据库连接2)：根据期间ID，查询物料结存数量、金额（包含子库信息）
http://10.8.1.25:100/api/154/713e3e1011.html?periodid=3829

   ```sql
   SELECT SN, NAME, SUM(QUANTITY) QUANTITY, ROUND(SUM(FIGURE), 2) FIGURE, DESCRIPTION REMARK, '3' TYPE FROM TBERP_INV_PERIOD 
      WHERE MAX_ID <= 3851 			-- 此处替换 期间ID
      AND (QUANTITY > 0 OR FIGURE > 0)
   GROUP BY SN, NAME, DESCRIPTION;
   ```

5. 接口3(数据库连接2)：根据期间ID，查询物料收入数量、金额，事务ID、名称
http://10.8.1.25:100/api/153/16a5f99c46.html?periodid=3829

   ```sql
   SELECT t.SN, t.NAME, SUM(t.QUANTITY) QUANTITY, SUM(t.figure) FIGURE, t.TRANSACTION_TYPE_NAME REMARK, '1' TYPE
   FROM TBERP_INV_INCOME t
   WHERE t.MAX_ID <= 3851				--此处替换 期间ID
   --AND t.INVENTORY_ITEM_ID = 4			
   GROUP BY t.SN, t.NAME, t.TRANSACTION_TYPE_NAME;
   ```

6. 接口4(数据库连接2)：根据前期间ID，查询物料付出数量、金额，账户别名
http://10.8.1.25:100/api/152/9b089d2e3c.html?periodid=3829

   ```sql
   SELECT t.SN, t.NAME, SUM(t.QUANTITY) QUANTITY, SUM(t.figure) FIGURE, t.DESCRIPTION REMARK, '2' TYPE
   FROM TBERP_INV_PAYOUT t
   WHERE t.MAX_ID <= 3851				--此处替换 期间ID
   --AND t.INVENTORY_ITEM_ID = 4			
   GROUP BY t.SN, t.NAME, t.DESCRIPTION;
   ```


##  呆滞库存分析

查询距今时间段（1-2，2-3，3-4，4-5，5以上）的库存信息

1. 根据用户选择的时间段，计算出时间段的起止日期（比如 start_date, end_date）

2. 根据起止日期，查询物料最后一次事务处理的信息
http://10.8.1.25:100/api/155/117dd652a7.html?from=1&tp=2
   ```sql
   select 
       t.sn, t.name, t.transaction_type_name,
       t.quantity, t.figure,t.description
   from
       TBERP_LAST_TRANSACTION t
   where
   	t.CREATION_DATE >= start_date AND t.creation_date <= end_date	--这里需注意时间的格式
   --	t.CREATION_DATE >= to_date(start_date, 'yyyy-mm-dd') AND t.creation_date <= to_date(end_date, 'yyyy-mm-dd')
   ORDER BY t.sn;
   ```

3. 根据起止日期，查询物料的结存数量、金额、子库

   ```sql
   SELECT SN, NAME, SUM(QUANTITY) QUANTITY, ROUND(SUM(FIGURE), 2) FIGURE, '' REMARK, '0' TYPE  FROM TBERP_INV_PERIOD 
      WHERE MAX_ID <= 3851 			-- 此处替换 期间ID
      AND (QUANTITY > 0 OR FIGURE > 0)
   GROUP BY SN, NAME;
   ```

   