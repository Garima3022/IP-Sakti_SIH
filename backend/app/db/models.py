import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization = Column(String, default="Ayurveda IP Research Institute")
    role = Column(String, default="Regulatory Specialist")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    formulas = relationship("Formula", back_populates="owner")

class Formula(Base):
    __tablename__ = "formulas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    classical_reference = Column(String, nullable=True)  # e.g., "Bhavaprakasha Nighantu", "Charaka Samhita"
    description = Column(Text, nullable=True)
    ingredients = Column(JSON, nullable=False)  # List of {name, sanskrit_name, botanical_name, percentage, part_used}
    indications = Column(String, nullable=True)  # e.g., "Nidranasha, Manas Roga, Shotha"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="formulas")
    audits = relationship("ComplianceAudit", back_populates="formula")

class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"

    id = Column(Integer, primary_key=True, index=True)
    formula_id = Column(Integer, ForeignKey("formulas.id"), nullable=True)
    novelty_score = Column(Float, default=0.0)  # 0 to 100
    sec_3p_risk = Column(String, default="LOW")  # LOW, MODERATE, HIGH
    cites_flag = Column(String, default="CLEAN")  # CLEAN, WARNING, BANNED
    international_eligibility = Column(JSON, nullable=True)  # {US_FDA, EU_EMA, GCC}
    citations = Column(JSON, nullable=True)  # List of citation mappings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    formula = relationship("Formula", back_populates="audits")

class BotanicalAlternative(Base):
    __tablename__ = "botanical_alternatives"

    id = Column(Integer, primary_key=True, index=True)
    banned_botanical_name = Column(String, index=True, nullable=False)
    banned_sanskrit_name = Column(String, nullable=True)
    alternative_name = Column(String, nullable=False)
    alternative_sanskrit_name = Column(String, nullable=True)
    justification = Column(Text, nullable=False)  # Matching Rasa, Veerya, Vipaka, Karma
    pharmacopoeia_reference = Column(String, nullable=False)  # e.g., "Ayurvedic Pharmacopoeia of India (API) Part I, Vol V"
