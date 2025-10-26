from sqlalchemy.orm import DeclarativeBase, declared_attr


class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: N805
        return cls.__name__.lower()


from app.db.models import audit_log  # noqa: E402,F401
from app.db.models import cita  # noqa: E402,F401
from app.db.models import cliente  # noqa: E402,F401
from app.db.models import detalle_orden  # noqa: E402,F401
from app.db.models import factura  # noqa: E402,F401
from app.db.models import historial_precio  # noqa: E402,F401
from app.db.models import orden_trabajo  # noqa: E402,F401
from app.db.models import producto  # noqa: E402,F401
from app.db.models import rol  # noqa: E402,F401
from app.db.models import usuario  # noqa: E402,F401
from app.db.models import vehiculo  # noqa: E402,F401
