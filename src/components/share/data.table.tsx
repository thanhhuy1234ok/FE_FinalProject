import {
    ProTable,
    type ParamsType,
    type ProTableProps,
} from '@ant-design/pro-components';
import vi_VN from 'antd/locale/vi_VN';
import { ConfigProvider } from 'antd';
import type { Key } from 'react';

type DataTableProps<
    T extends Record<string, unknown>,
    U extends ParamsType = ParamsType,
    ValueType = 'text',
> = ProTableProps<T, U, ValueType> & {
    /** optional default id key */
    rowKey?: keyof T | ((record: T) => Key);
};

const DataTable = <
    T extends Record<string, unknown>,
    U extends ParamsType = ParamsType,
    ValueType = 'text',
>({
    columns,
    defaultData = [],
    dataSource,
    postData,
    pagination,
    loading,
    rowKey = 'id' as keyof T, // 👈 type-safe default
    scroll,
    params,
    request,
    search,
    polling,
    toolBarRender,
    headerTitle,
    actionRef,
    dateFormatter = 'string',
    rowSelection,
}: DataTableProps<T, U, ValueType>) => {
    return (
        <ConfigProvider locale={vi_VN}>
            <ProTable<T, U, ValueType>
                columns={columns}
                defaultData={defaultData}
                dataSource={dataSource}
                postData={postData}
                pagination={pagination}
                bordered
                loading={loading}
                rowKey={rowKey}
                scroll={scroll}
                params={params}
                request={request}
                search={search}
                polling={polling}
                toolBarRender={toolBarRender}
                headerTitle={headerTitle}
                actionRef={actionRef}
                dateFormatter={dateFormatter}
                rowSelection={rowSelection}
            />
        </ConfigProvider>
    );
};

export default DataTable;
