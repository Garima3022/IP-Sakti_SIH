import asyncio
from app.db.database import init_db, AsyncSessionLocal
from app.db.models import BotanicalAlternative, User
from app.auth.security import get_password_hash

SEED_ALTERNATIVES = [
    {
        "banned_botanical_name": "Saussurea costus",
        "banned_sanskrit_name": "Kushta (Kuth)",
        "alternative_name": "Inula racemosa",
        "alternative_sanskrit_name": "Pushkarmoola",
        "justification": "Matches Katu-Tikta Rasa (taste), Ushna Veerya (potency), and Katu Vipaka (post-digestive effect). Highly effective for Shwasa (bronchial spasm), Kasa (cough), and Hridroga (cardiac distress) as per Bhavaprakasha Nighantu.",
        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol II & Ayurvedic Formulary of India (AFI) Appendix III"
    },
    {
        "banned_botanical_name": "Pterocarpus santalinus",
        "banned_sanskrit_name": "Rakta Chandana (Red Sanders)",
        "alternative_name": "Rubia cordifolia / Vetiveria zizanioides",
        "alternative_sanskrit_name": "Manjistha / Usheera",
        "justification": "Equivalent Tikta-Kashaya Rasa, Sheeta Veerya, Madhura Vipaka. Potent Rakta Shodhaka (blood purifier) and Daha Prashamana (burning sensation reducer) with identical therapeutic efficacy in Pitta-Rakta disorders.",
        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol III"
    },
    {
        "banned_botanical_name": "Nardostachys jatamansi",
        "banned_sanskrit_name": "Jatamansi",
        "alternative_name": "Valeriana wallichii",
        "alternative_sanskrit_name": "Tagara",
        "justification": "Shared Tikta-Kashaya-Madhura Rasa, Anushna/Sheeta Veerya, Katu Vipaka. Demonstrates matching Medhya (neuro-protective), Manas-dosha hara, and Nidrajanaka (sleep promoting) bio-activity.",
        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol I & D&C Act Schedule E(1) Guidance"
    },
    {
        "banned_botanical_name": "Rauvolfia serpentina",
        "banned_sanskrit_name": "Sarpagandha",
        "alternative_name": "Convolvulus pluricaulis",
        "alternative_sanskrit_name": "Shankhapushpi",
        "justification": "Calms Vata-Pitta in Rakta Vata (hypertension) and Nidranasha (insomnia) without modern reserpine toxicity concerns. Classical replacement in mental agitation.",
        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol IV"
    },
    {
        "banned_botanical_name": "Aquilaria agallocha",
        "banned_sanskrit_name": "Agaru (Agarwood)",
        "alternative_name": "Cedrus deodara",
        "alternative_sanskrit_name": "Devadaru",
        "justification": "Identical Katu-Tikta Rasa, Ushna Veerya, Katu Vipaka. Strong Kapha-Vata Shamaka, Vedanasthapana (analgesic), and Shothahara (anti-inflammatory) action.",
        "pharmacopoeia_reference": "Ayurvedic Pharmacopoeia of India (API) Part I, Vol IV"
    }
]

async def seed_data():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Seed botanical alternatives if empty
        from sqlalchemy.future import select
        res = await session.execute(select(BotanicalAlternative))
        existing = res.scalars().all()
        if not existing:
            for item in SEED_ALTERNATIVES:
                alt = BotanicalAlternative(**item)
                session.add(alt)
            await session.commit()
            print("Successfully seeded Botanical Alternatives dataset.")

        # Seed default admin specialist user if empty
        user_res = await session.execute(select(User).filter(User.email == "specialist@ayurvedasathi.gov.in"))
        if not user_res.scalars().first():
            hashed_pw = get_password_hash("Sathi#2026!AYUSH")
            user = User(
                email="specialist@ayurvedasathi.gov.in",
                hashed_password=hashed_pw,
                organization="National Institute of Ayurveda / Ministry of Ayush",
                role="Senior Regulatory Specialist"
            )
            session.add(user)
            await session.commit()
            print("Successfully seeded Default Regulatory Specialist User.")

if __name__ == "__main__":
    asyncio.run(seed_data())
