from __future__ import annotations
from abc import ABC, abstractmethod
from .operation import OperationFolder


class LibraryAPI(ABC):
    @abstractmethod
    def getOperationHierarchy(self) -> OperationFolder:
        pass
