import React from "react";
import {Pagination} from "antd";
import counterpart from "counterpart";
import {Table} from "bitshares-ui-style-guide";
import "./paginated-list.scss";

export default class PaginatedList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pageSize: props.pageSize
        };
    }

    static defaultProps = {
        rows: [],
        pageSize: 20,
        label: "utility.total_x_items",
        className: "table",
        extraRow: null,
        style: {paddingBottom: "1rem"}
    };

    render() {
        const {pageSize} = this.state;
        const {header, rows, extraRow} = this.props;

        const pageSizeOptions = [10, 20, 30, 40, 50, 100].filter(
            item => item < rows.length
        );
        pageSizeOptions.push(rows.length);
        return (
            <div className="paginated-list" style={this.props.style}>
                <Table
                    dataSource={rows}
                    uns
                    columns={Array.isArray(header) ? header : []}
                    footer={() => (extraRow ? extraRow : <span>&nbsp;</span>)}
                    onChange={this.props.toggleSortOrder}
                    pagination={{
                        showSizeChanger: true,
                        hideOnSinglePage: false,
                        defaultPageSize: pageSize,
                        pageSizeOptions,
                        showTotal: (total, range) =>
                            counterpart.translate(this.props.label, {
                                count: total
                            })
                    }}
                    rowClassName={
                        this.props.rowClassName == null
                            ? undefined
                            : (record, index) =>
                                  this.props.rowClassName(record, index)
                    }
                    rowSelection={this.props.rowSelection}
                />
                {this.props.children}
            </div>
        );
    }
}
