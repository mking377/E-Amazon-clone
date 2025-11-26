from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Payment Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PaymentRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "USD"
    payment_method: str

class PaymentResponse(BaseModel):
    payment_id: str
    status: str
    message: str

@app.get("/")
async def root():
    return {"message": "Payment service is running!"}

@app.post("/api/payments/process", response_model=PaymentResponse)
async def process_payment(payment: PaymentRequest):
    try:
        payment_id = f"pay_{payment.order_id}"
        
        return PaymentResponse(
            payment_id=payment_id,
            status="success",
            message="Payment processed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/payments/{payment_id}")
async def get_payment(payment_id: str):
    return {
        "payment_id": payment_id,
        "status": "completed",
        "amount": 100.0,
        "currency": "USD"
    }
