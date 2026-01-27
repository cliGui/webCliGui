from __future__ import annotations
from abc import ABC, abstractmethod
from .operation import OperationFolder
from .parameters import ParameterData


class LibraryAPI(ABC):
    @abstractmethod
    def getOperationHierarchy(self) -> OperationFolder:
        pass

    @abstractmethod
    def getDescription(self, operationBranch: list[str]) -> str:
        pass

    @abstractmethod
    def getParameters(self, operationBranch: list[str]) -> ParameterData:
        pass
