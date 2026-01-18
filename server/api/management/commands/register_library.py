# myapp/management/commands/register_function.py
import importlib
import inspect
from django.core.management.base import BaseCommand, CommandError
from api.register_library import register_library

class Command(BaseCommand):
    help = "Register a librarty api class"

    REQUIRED_METHODS = {
        "getOperationHierarchy": 0,
    }

    def add_arguments(self, parser):
        parser.add_argument("library_name")
        parser.add_argument("module_path")
        parser.add_argument("class_name")
        parser.add_argument(
            "--description",
            default="",
            help="Optional description",
        )

    def validate_class(self, module_path: str, class_name: str):
        module = importlib.import_module(module_path)
        cls = getattr(module, class_name)
        if not inspect.isclass(cls):
            raise ValueError(f"'{class_name}' is not a class")  

        for method_name, arg_count in self.REQUIRED_METHODS.items():
          if not hasattr(cls, method_name):
              raise ValueError(f"Missing required method: {method_name}")

          method = getattr(cls, method_name)
          if not callable(method):
              raise ValueError(f"{method_name} is not callable")

          sig = inspect.signature(method)

          # remove 'self' or 'cls'
          params = list(sig.parameters.values())
          if params and params[0].name in ("self", "cls"):
              params = params[1:]

          if len(params) != arg_count:
              raise ValueError(
                  f"{method_name} must take {arg_count} argument(s)"
              )

    def handle(self, *args, **options):
        try:
            library_name = options["library_name"]
            module_path = options["module_path"]
            class_name = options["class_name"]
            description = options["description"]

            self.validate_class(module_path, class_name)
 
            register_library(
                library_name=library_name,
                module_path=module_path,
                class_name=class_name,
                description=description,
            )
        except Exception as e:
            raise CommandError(str(e))

        self.stdout.write(
            self.style.SUCCESS("Library registered successfully")
        )
