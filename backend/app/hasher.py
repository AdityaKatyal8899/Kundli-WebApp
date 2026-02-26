from passlib.context import CryptContext

pass_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

class Hash():
    
    def bcrypt(password):
        return pass_context.hash(password)
    
    def verify(request_pass, hashed_pass):
        return pass_context.verify(request_pass, hashed_pass)