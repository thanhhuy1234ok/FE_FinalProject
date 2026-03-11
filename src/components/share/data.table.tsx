import {
    ProTable,
    type ParamsType,
    type ProTableProps,
} from "@ant-design/pro-components";
import vi_VN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import type { Key } from "react";

type DataTableProps<
    T extends object,
    U extends ParamsType = ParamsType,
    ValueType = "text",
> = ProTableProps<T, U, ValueType> & {
    rowKey?: keyof T | ((record: T) => Key);
};

const DataTable = <
    T extends object,
    U extends ParamsType = ParamsType,
    ValueType = "text",
>({
    columns,
    defaultData = [],
    dataSource,
    postData,
    pagination,
    loading,
    rowKey,
    scroll,
    params,
    request,
    search,
    polling,
    toolBarRender,
    headerTitle,
    actionRef,
    dateFormatter = "string",
    rowSelection,
    options = {},
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
                rowKey={rowKey ?? "id"}
                scroll={scroll}
                params={params}
                request={request}
                polling={polling}
                toolBarRender={toolBarRender}
                headerTitle={headerTitle}
                actionRef={actionRef}
                dateFormatter={dateFormatter}
                rowSelection={rowSelection}
                options={options}
                search={
                    search ?? {
                        layout: "vertical",
                        defaultCollapsed: false,
                        span: 6,
                        labelWidth: 55,
                    }
                }
            />
        </ConfigProvider>
    );
};

export default DataTable;
