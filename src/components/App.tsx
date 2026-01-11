import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import CreateTask from './CreateTask';

const App  = () => {
  const [selectedTabKey, setSelectedTabKey] = useState('createTask');

  return (
    <div className="flex flex-col">
      <div className="p-10 max-w-[1325px]">
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
    </div>
  );
};

export default App;
