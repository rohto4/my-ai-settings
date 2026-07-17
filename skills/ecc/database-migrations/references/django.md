# Django Runner

Load only after Django is adopted and its pinned version, migration settings, and target database behavior are confirmed. Validate operations with the current [Django migrations documentation](https://docs.djangoproject.com/en/stable/topics/migrations/) before execution.

## Retained workflow examples

```powershell
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
python manage.py makemigrations --empty app_name -n description
```

## Retained data-migration example

```python
from django.db import migrations


def backfill_display_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    batch_size = 5000
    users = User.objects.filter(display_name="")
    while users.exists():
        batch = list(users[:batch_size])
        for user in batch:
            user.display_name = user.username
        User.objects.bulk_update(batch, ["display_name"], batch_size=batch_size)


def reverse_backfill(apps, schema_editor):
    pass  # Data migration intentionally has no reverse operation.


class Migration(migrations.Migration):
    dependencies = [("accounts", "0015_add_display_name")]
    operations = [
        migrations.RunPython(backfill_display_names, reverse_backfill),
    ]
```

Do not use the retained loop as a production default. Inspect the generated SQL, transaction mode, lock behavior, batch resume behavior, and an interruption path. Move a large backfill to a separately operated resumable job when that is safer.

## Retained `SeparateDatabaseAndState` example

```python
class Migration(migrations.Migration):
    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.RemoveField(model_name="user", name="legacy_field"),
            ],
            database_operations=[],
        ),
    ]
```

Use this only when the PJ intentionally separates model state from physical schema change and has a later, compatible contract step.
