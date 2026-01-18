from dataclasses import dataclass, field
from enum import Enum
from typing import List, Union

class OperationType(Enum):
    MODULE = "module"
    PIPX = "pipx"

@dataclass
class Operation:
    operation_type: OperationType
    operation_name: str
    operation_module: str | None = None

    def to_dict(self) -> dict:
        return {
            "operation_type": self.operation_type.value,
            "operation_name": self.operation_name,
            "operation_module": self.operation_module,
        }


@dataclass
class OperationFolder:
    folder_name: str
    portfolio: List[Union['Operation', 'OperationFolder']] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "folder_name": self.folder_name,
            "portfolio": [item.to_dict() for item in self.portfolio],
        }
