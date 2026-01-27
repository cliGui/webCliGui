from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum

class OperationType(Enum):
    MODULE = "module"
    PIPX = "pipx"

@dataclass
class OperationBase:
    name: str

@dataclass
class Operation(OperationBase):
    operation_type: OperationType
    operation_module: str | None = None

@dataclass
class OperationFolder(OperationBase):
    portfolio: list[Operation | OperationFolder] = field(default_factory=list)
