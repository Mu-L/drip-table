/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : helloqian12138 (johnhello12138@163.com)
 * @modifier : helloqian12138 (johnhello12138@163.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */
import './index.less';

import classNames from 'classnames';
import { DripTableBuiltInColumnSchema, DripTableExtraOptions, DripTableProps } from 'drip-table';
import React from 'react';

import { filterArray } from '@/utils';
import { GeneratorContext } from '@/context';
import { DTGTableConfig } from '@/context/table-configs';
import { DataSourceTypeAbbr, DripTableGeneratorProps } from '@/typing';

import TableCell from '../cell';

interface TableRowListProps<
RecordType extends DataSourceTypeAbbr<NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
ExtraOptions extends Partial<DripTableExtraOptions> = never,
>{
  rowIndex: number;
  scrollTarget: string;
  scrollLeft: number;
  tableConfig: DTGTableConfig;
  record: RecordType;
  customComponents: DripTableProps<RecordType, ExtraOptions>['components'];
  customComponentPanel: DripTableGeneratorProps<RecordType, ExtraOptions>['customComponentPanel'] | undefined;
  mockDataSource: DripTableGeneratorProps<RecordType, ExtraOptions>['mockDataSource'];
  dataFields: DripTableGeneratorProps<RecordType, ExtraOptions>['dataFields'];
  onScroll: (scrollLeft: number) => void;
}

const VerticalAligns = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
};

const TableRowList = <
RecordType extends DataSourceTypeAbbr<NonNullable<ExtraOptions['SubtableDataSourceKey']>>,
ExtraOptions extends Partial<DripTableExtraOptions> = never,
>(props: TableRowListProps<RecordType, ExtraOptions>) => {
  const { currentTableID, currentColumnID, currentHoverColumnID } = React.useContext(GeneratorContext);
  const scrollableRow = React.useRef<HTMLDivElement>(null);
  const columnList = React.useMemo(() => props.tableConfig.columns.map((item, index) => ({ id: index + 1, column: item })), [props.tableConfig.columns]);
  const sortableColumns = filterArray(columnList, item => !item.column.fixed);

  React.useEffect(() => {
    if (scrollableRow.current && props.scrollTarget !== `__row_${props.rowIndex}`) {
      scrollableRow.current.scrollLeft = props.scrollLeft;
    }
  }, [props.scrollLeft, props.scrollTarget]);

  const renderTableCell = (column: DripTableBuiltInColumnSchema, index: number, extraOptions?: {
    showRightShadow?: boolean;
    showLeftShadow?: boolean;
  }) => (
    <div
      key={index}
      className={classNames('jfe-drip-table-generator-workstation-table-tr-td', {
        [props.tableConfig.configs.size || 'default']: props.tableConfig.configs.size,
        bordered: props.tableConfig.configs.bordered,
        checked: column.key === currentColumnID && props.tableConfig.tableId === currentTableID,
        hovered: column.key === currentHoverColumnID,
        'right-shadow': extraOptions?.showRightShadow,
        'left-shadow': extraOptions?.showLeftShadow,
      })}
      style={{
        justifyContent: column.align || 'center',
        alignItems: VerticalAligns[column.verticalAlign || 'middle'],
        width: column.width,
      }}
    >
      <TableCell
        record={props.record}
        column={column}
        customComponents={props.customComponents}
        customComponentPanel={props.customComponentPanel}
        mockDataSource={props.mockDataSource}
        dataFields={props.dataFields}
      />
    </div>
  );

  return (
    <div className={classNames('jfe-drip-table-generator-workstation-table-tr-wrapper')}>
      { sortableColumns[0] && sortableColumns[0].id > 1
        ? props.tableConfig.columns
          .filter((item, index) => item.fixed && index < sortableColumns[0].id)
          .map((column, index) => renderTableCell(column as DripTableBuiltInColumnSchema, index, {
            showRightShadow: column.fixed && !props.tableConfig.columns[index + 1]?.fixed,
          }))
        : null }
      <div
        ref={scrollableRow}
        className="jfe-drip-table-generator-workstation-table-tr-scrollbar"
        style={{
          width: typeof props.tableConfig.configs.scroll?.x === 'boolean' ? '100%' : props.tableConfig.configs.scroll?.x,
        }}
        onScroll={(e) => { if (props.scrollTarget === `__row_${props.rowIndex}`) { props.onScroll((e.target as HTMLDivElement).scrollLeft); } }}
      >
        { props.tableConfig.columns.filter(item => !item.fixed).map((column, index) => renderTableCell(column as DripTableBuiltInColumnSchema, index)) }
      </div>
      { sortableColumns[sortableColumns.length - 1] && sortableColumns[sortableColumns.length - 1].id < columnList.length
        ? props.tableConfig.columns
          .filter((item, index) => item.fixed && index >= sortableColumns[sortableColumns.length - 1].id)
          .map((column, index) => renderTableCell(column as DripTableBuiltInColumnSchema, index, {
            showLeftShadow: !index,
          }))
        : null }
    </div>
  );
};

export default TableRowList;
