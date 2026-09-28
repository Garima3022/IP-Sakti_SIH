from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import User, Formula, ComplianceAudit, BotanicalAlternative

class Repository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # User operations
    async def create_user(self, email: str, hashed_password: str, organization: str = "Ayurveda IP Research Institute", role: str = "Regulatory Specialist") -> User:
        user = User(email=email, hashed_password=hashed_password, organization=organization, role=role)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    # Formula operations
    async def save_formula(self, title: str, ingredients: list, user_id: Optional[int] = None, classical_reference: Optional[str] = None, description: Optional[str] = None, indications: Optional[str] = None) -> Formula:
        formula = Formula(
            user_id=user_id,
            title=title,
            classical_reference=classical_reference,
            description=description,
            ingredients=ingredients,
            indications=indications
        )
        self.db.add(formula)
        await self.db.commit()
        await self.db.refresh(formula)
        return formula

    async def get_formulas(self, user_id: Optional[int] = None) -> List[Formula]:
        query = select(Formula)
        if user_id:
            query = query.filter(Formula.user_id == user_id)
        result = await self.db.execute(query.order_by(Formula.created_at.desc()))
        return result.scalars().all()

    async def get_formula_by_id(self, formula_id: int) -> Optional[Formula]:
        result = await self.db.execute(select(Formula).filter(Formula.id == formula_id))
        return result.scalars().first()

    # Compliance Audit operations
    async def save_audit(self, formula_id: int, novelty_score: float, sec_3p_risk: str, cites_flag: str, international_eligibility: dict, citations: list) -> ComplianceAudit:
        audit = ComplianceAudit(
            formula_id=formula_id,
            novelty_score=novelty_score,
            sec_3p_risk=sec_3p_risk,
            cites_flag=cites_flag,
            international_eligibility=international_eligibility,
            citations=citations
        )
        self.db.add(audit)
        await self.db.commit()
        await self.db.refresh(audit)
        return audit

    # Botanical Alternative operations
    async def get_all_alternatives(self) -> List[BotanicalAlternative]:
        result = await self.db.execute(select(BotanicalAlternative))
        return result.scalars().all()

    async def find_alternative(self, botanical_or_sanskrit_name: str) -> Optional[BotanicalAlternative]:
        name_lower = botanical_or_sanskrit_name.lower().strip()
        result = await self.db.execute(
            select(BotanicalAlternative).filter(
                (BotanicalAlternative.banned_botanical_name.ilike(f"%{name_lower}%")) |
                (BotanicalAlternative.banned_sanskrit_name.ilike(f"%{name_lower}%"))
            )
        )
        return result.scalars().first()
