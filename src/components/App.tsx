import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import CreateTask from './CreateTask';

const App  = () => {
  const [selectedTabKey, setSelectedTabKey] = useState('createTask');

  return (
    <div className="flex flex-col p-5 pt-3 max-w-[1325px]">
      {/* <h3 className="pb-4">Web UI Command Services Executor</h3> */}

      <Tabs defaultActiveKey="createTask" 
          mountOnEnter
          activeKey={selectedTabKey}
          onSelect={(tab: string | null) => setSelectedTabKey(tab as string)}
          className="mb-3 container-tabs">

        <Tab eventKey="createTask" title="Create task">
          <CreateTask />
        </Tab>

        <Tab eventKey="status" title="Status">
          Status
        </Tab>
      </Tabs>
    </div>
  );
};

export default App;
