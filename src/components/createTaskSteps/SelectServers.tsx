import React from "react";
import { WEB_CLI_GUI_SERVER } from "@store/createTask/createTaskIf";
import Button from "../regalia/Button";

const SelectServers = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="webCliGuiServerRB" value="webCliGuiServer" />
        <label htmlFor="webCliGuiServerRB">{WEB_CLI_GUI_SERVER}</label>
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="selectServersRB" value="selectServers" disabled />
        <label htmlFor="selectServersRB" className="w-35 text-gray-300">Select Servers</label>
        <select className="w-35 text-gray-300 border p-1" disabled>
          <option value="">--select server--</option>
        </select>
        <Button className="!h-9 px-3 py-1 !ml-4" disabled>Add</Button>
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="selectRegionsRB" value="selectRegions" disabled />
        <label htmlFor="selectRegionsRB" className="w-35 text-gray-300">Select Cluster</label>
        <select className="w-35 text-gray-300 border p-1" disabled>
          <option value="">--select cluster--</option>
        </select>
        <Button className="!h-9 px-3 py-1 !ml-4" disabled>Add</Button>
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="uploadServersRB" value="uploadServers" disabled />
        <label htmlFor="uploadServersRB" className="w-35 text-gray-300">Upload servers</label>
        <Button className="!h-9 px-3 py-1" disabled>Select file</Button>
      </div>
    </div>
  );
};

export default SelectServers;
