from .models import LibraryRegistration

def register_library(
    library_name: str,
    module_path: str,
    class_name: str,
    description: str = "",
):
    return LibraryRegistration.objects.create(
        library_name=library_name,
        module_path=module_path,
        class_name=class_name,
        description=description,
    )
