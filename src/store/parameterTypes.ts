

export enum ParameterType {
  PREFERENCE = "preference",
  STRING_VALUE = "string_value",
  VALUE_OPTIONS = "value_options",
  PARAMETER_LIST = "parameter_list",
  PARAMETER_OPTIONS_TO_LIST = "parameter_options_to_list",
}

export type ParameterValue = string | number | boolean;

export interface ParameterBase {
  name: string;
  type: ParameterType;
  mandatory: boolean;
  description: string | null;
  isSelected: boolean;
}

export interface ParameterPreference extends ParameterBase {
}

export interface ParameterStringValue extends ParameterBase {
  value: string;
}

export interface ParameterList extends ParameterBase {
  parameters: ParameterBase[];
}

export interface ParameterOptionsToList extends ParameterBase {
  options: ParameterList[];
  selectedListIdx: number;
}

export type ParameterData = ParameterList | ParameterOptionsToList;
