import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import OfferingSubmissionWizard from "@/components/OfferingSubmissionWizard";
import { useActiveInitiative } from "@/hooks/useActiveInitiative";

const Offri = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const { data: initiative } = useActiveInitiative();

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => navigate("/galleria"), 3000);
    return () => clearTimeout(timer);
  }, [submitted, navigate]);

  if (submitted) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
        <MinimalHeader />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-6">Accolta</h1>
            <p className="text-lg italic text-muted-foreground mb-2">
              La tua cavapendolata è stata accolta.
            </p>
            <p className="text-lg italic text-muted-foreground mb-12">
              Ora è in attesa di entrare.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link
                to="/galleria"
                className="font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-3 border border-foreground/30 hover:bg-foreground hover:text-primary-foreground transition-all duration-500"
              >
                Vai alla Galleria →
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="font-mono-light text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Lascia un'altra cavapendolata
              </button>
            </div>
          </motion.div>
        </main>
        <MinimalFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {initiative && (
              <div className="mb-8 text-center">
                <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.14em] text-accent mb-2">
                  Un pensiero
                </p>
                <h1 className="text-2xl md:text-3xl font-light text-foreground mb-2">
                  {initiative.prompt}
                </h1>
                {initiative.details && (
                  <p className="text-sm italic text-muted-foreground">
                    {initiative.details}
                  </p>
                )}
              </div>
            )}
            <OfferingSubmissionWizard
              title="Lascia una cavapendolata"
              subtitle="Qualcosa che possa stare qui."
              onSubmitted={() => setSubmitted(true)}
            />
          </motion.div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Offri;
