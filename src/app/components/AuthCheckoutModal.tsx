import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Lock, 
  Sparkles, 
  Bell, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface AuthCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthCheckoutModal({ isOpen, onClose }: AuthCheckoutModalProps) {
  const [step, setStep] = React.useState<"account" | "payment">("account");

  const features = [
    { icon: <Sparkles className="w-4 h-4" />, title: "AI-Driven Deep Analysis", desc: "Automated qualitative reports on 1,200+ global assets." },
    { icon: <Bell className="w-4 h-4" />, title: "WhatsApp Alert System", desc: "Instant notifications when your thresholds are breached." },
    { icon: <ShieldCheck className="w-4 h-4" />, title: "Privacy-First Vault", desc: "No data sharing. Your portfolio stays strictly local." },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-card border-border rounded-[2rem] p-0 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        <div className="sr-only">
          <DialogTitle>Pro Plan Upgrade</DialogTitle>
          <DialogDescription>Authenticating account and processing payment for premium Pro Plan subscription.</DialogDescription>
        </div>
        {/* Left Side: Pro Plan Showcase */}
        <div className="md:w-[40%] bg-secondary/30 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-foreground text-background text-xs font-semibold rounded-full inline-block">
                Member Tier
              </span>
              <h2 className="text-3xl font-bold text-foreground">
                Pro Plan
              </h2>
            </div>

            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-muted-foreground shadow-sm">
                    {f.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-border/50">
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-bold text-foreground">$49.00</span>
              <span className="text-sm text-muted-foreground font-medium">/ Month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Billed annually. Cancel anytime.</p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-10 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-2">
                <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 'account' ? 'bg-foreground' : 'bg-muted'}`} />
                <div className={`h-1.5 w-12 rounded-full transition-colors ${step === 'payment' ? 'bg-foreground' : 'bg-muted'}`} />
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure 256-bit SSL</span>
              </div>
            </div>

            {step === "account" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">Secure Login</h3>
                  <p className="text-sm text-muted-foreground font-medium">Step 1: Authenticate your credentials</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="name@firm.com" 
                      className="h-12 bg-background border-border rounded-xl text-sm font-medium focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
                      <button className="text-xs font-medium text-muted-foreground hover:text-foreground">Forgot?</button>
                    </div>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-12 bg-background border-border rounded-xl text-sm font-medium focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">Payment Method</h3>
                  <p className="text-sm text-muted-foreground font-medium">Step 2: Enter encrypted payment details</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Cardholder Name</Label>
                    <Input 
                      placeholder="Johnathan P. Doe" 
                      className="h-12 bg-background border-border rounded-xl text-sm font-medium focus:ring-primary/20 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground ml-1">Card Number</Label>
                    <div className="relative">
                      <Input 
                        placeholder="0000 0000 0000 0000" 
                        className="h-12 bg-background border-border rounded-xl text-sm font-mono font-medium focus:ring-primary/20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1 grayscale opacity-50">
                        <div className="w-8 h-5 bg-muted rounded" />
                        <div className="w-8 h-5 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground ml-1">Expiry Date</Label>
                      <Input 
                        placeholder="MM/YY" 
                        className="h-12 bg-background border-border rounded-xl text-sm font-mono font-medium focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground ml-1">CVC Code</Label>
                      <Input 
                        placeholder="•••" 
                        className="h-12 bg-background border-border rounded-xl text-sm font-mono font-medium focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-10 flex flex-col space-y-4">
            {step === "account" ? (
              <button 
                onClick={() => setStep("payment")}
                className="h-14 w-full bg-foreground text-background rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-md group"
              >
                <span>Continue to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={onClose}
                  className="h-14 w-full bg-foreground text-background rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  <Lock className="w-4 h-4" />
                  <span>Complete Purchase</span>
                </button>
                <button 
                  onClick={() => setStep("account")}
                  className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Account Details
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4 pt-2">
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-medium text-muted-foreground/60">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span className="text-[10px] font-medium text-muted-foreground/60">No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}