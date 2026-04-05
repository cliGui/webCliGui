
from collections import deque
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime, timedelta
import re
import threading

from webcligui_api import LibraryAPI, OperationState, OperationStatusStart
from .models import Status

STATUS_FILE_NAME = 'neda_status.txt'
OPERATION_FILE_NAME ='neda_operation.txt'
CHECK_UUIDS_TIMER_INTERVAL = 15

@dataclass
class OperationStatus:
    uuid: str
    operation_branch: list[str]
    start_time: datetime
    status: str
    folder: str
    elapsed_time: timedelta | None = None

class OperationHandling:
  uuids = {}

  def __init__(self):
    self.uuidsLock = threading.Lock()
    self.runInterval()

  def runInterval(self):
    startTime = datetime.now()
    self.checkUuids()

    diffTime = max(CHECK_UUIDS_TIMER_INTERVAL - (datetime.now() - startTime).total_seconds(), 0)
    threading.Timer(diffTime, self.runInterval).start()

  def checkUuids(self):
    with self.uuidsLock:
      uuidsCopy = deepcopy(self.uuids)
    for uuid, folder in uuidsCopy.items():
      print('  uuid:', uuid)
      self.checkUuid(uuid, folder)
          
  def checkUuid(self, uuid, folder):
    with open(f"{folder}/{STATUS_FILE_NAME}", "r") as statusFile:
      lastLine = deque(statusFile, maxlen=1)[0] if statusFile else None
    print(lastLine)
    if not lastLine.startswith('Elapsed time'):
      return
    match = re.match(r"Elapsed time:\s*(\d+):(\d+):(\d+)(?:\.(\d+))?,\s*(.*)\n", lastLine)
    if match:
      h, m, s, us, statusText = match.groups()
      elapsed_time = timedelta(
        hours=int(h),
        minutes=int(m),
        seconds=int(s),
        microseconds=int(us or 0)
      )

    stat = Status.objects.get(id=uuid)
    stat.elapsed_time = elapsed_time
    stat.status = statusText
    stat.save()

    if statusText == OperationState.FINISHED.value:
      with self.uuidsLock:
        del self.uuids[uuid]

  def submitOperation(self, libraryApiImpl: LibraryAPI, operationBranch: list[str], command: list[str], servers: list[str]):

    operationStatusStart = libraryApiImpl.submitOperation(operationBranch, command, servers)

    status = OperationStatus(uuid=operationStatusStart.uuid, operation_branch=operationBranch, 
                             start_time=operationStatusStart.start_time, elapsed_time=None,
                            status=OperationState.STARTED.value, folder=operationStatusStart.folder)

    with open(f"{status.folder}/{OPERATION_FILE_NAME}", "w") as opFile:
        opFile.write(f"uuid: {status.uuid}\n")
        opFile.write(f"operationBranch: {operationBranch}\n")
        opFile.write(f"command: {command}\n")
        opFile.write(f"folder: {status.folder}\n")
        opFile.write(f"start_time: {status.start_time}\n")

    with open(f"{status.folder}/neda_status.txt", "a") as statusFile:      
        statusFile.write(f"Start time: {status.start_time.isoformat()}, {status.status}\n")

    Status.objects.create(id=status.uuid, operation_branch=operationBranch, start_time=status.start_time,
                          status=status.status, directory=status.folder)
    
    with self.uuidsLock:
      self.uuids[status.uuid] = status.folder
    
    return status
