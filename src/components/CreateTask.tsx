import React from "react";
import Tree from 'rc-tree';

const treeData = [
  {
    key: '0-0',
    title: 'parent 1',
    children: [
      { key: '0-0-0', title: 'parent 1-1', children: [{ key: '0-0-0-0', title: 'parent 1-1-0' }] },
      {
        key: '0-0-1',
        title: 'parent 1-2',
        children: [
          { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
          { key: '0-0-1-1', title: 'parent 1-2-1' },
        ],
      },
    ],
  },
  {
    key: '0-1',
    title: 'parent 2',
    children: [
      { key: '0-1-0', title: 'parent 2-1' },
      { key: '0-1-1', title: 'parent 2-2' },
    ],  
  }
];


const CreateTask = () => {

  return (
    <>
      <Tree treeData={treeData} showLine />
    </>
  );
};

export default CreateTask;
