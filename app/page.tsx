import Link from "next/link";
import {
  Plane,
  Clock,
  Sparkles,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Turnaround Operations",
    description:
      "Real-time flight tracking and event logging. Monitor every step from aircraft arrival to pushback with live status updates.",
  },
  {
    icon: Sparkles,
    title: "Grooming Management",
    description:
      "Standardized cleaning workflows and scheduling. Assign crews, track completion, and ensure consistent quality across stations.",
  },
  {
    icon: AlertTriangle,
    title: "Damage Reports",
    description:
      "Mobile-first incident documentation with photo capture. Structured approval chain from agent to station manager.",
  },
  {
    icon: BarChart3,
    title: "SLA Compliance",
    description:
      "Automated performance tracking and reporting. Identify bottlenecks, measure on-time performance, and generate airline-ready reports.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              AviationIQ
            </span>
          </div>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Digitize Your Ground Handling Operations
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80 sm:mt-6 sm:text-xl">
              Replace paper checklists, Excel spreadsheets, and WhatsApp groups
              with a single real-time operations platform. Track turnarounds, manage
              grooming, document damage, and monitor SLA compliance — all from one
              system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-background px-6 text-sm font-medium text-foreground shadow transition-colors hover:bg-background/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything You Need on the Ramp
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Purpose-built modules for every aspect of ground handling operations,
              designed to work on mobile devices in outdoor conditions.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for Regional Airlines
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              AviationIQ is designed for ground handling operations at regional
              carriers managing 10 to 100 daily flights across 3 to 15 stations.
              Our platform scales with your operation — whether you are a single-station
              handler or a growing network across Canada and the United States.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              "Real-time flight board with live status updates",
              "Multi-station, multi-tenant architecture",
              "Role-based access for agents, supervisors, and managers",
              "Offline-capable mobile interface for ramp use",
              "Automated SLA tracking against airline contracts",
              "Structured approval workflows for incident reports",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              AviationIQ
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AviationIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
