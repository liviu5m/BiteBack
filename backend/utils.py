pwd_context = CryptContext(
    schemes=["sha256_crypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def hashPassword(password: str):
    return pwd_context.hash(password)

def verifyPassword(plainPassword, hashedPassword):
    return pwd_context.verify(plainPassword, hashedPassword)