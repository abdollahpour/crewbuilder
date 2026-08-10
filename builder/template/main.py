from pydantic import BaseModel

from crewai.flow import Flow, listen, start

from crew import kickoff_crew


class CrewFlowState(BaseModel):
    request: str = ""
    report: str = ""


class CrewFlow(Flow[CrewFlowState]):
    @start()
    def collect_request(self, crewai_trigger_payload: dict | None = None):
        if crewai_trigger_payload:
            self.state.request = crewai_trigger_payload.get("topic", "").strip()
        else:
            self.state.request = input("Enter your request: ").strip()

        if not self.state.request:
            self.state.request = "General research task"

        print(f"Request: {self.state.request}")

    @listen(collect_request)
    def run_crew(self):
        result = kickoff_crew(inputs={"topic": self.state.request})
        self.state.report = result.raw
        print("Coordinator finished delegating to the team.")

    @listen(run_crew)
    def summarize(self):
        print("Final report: output/report.md")


def kickoff():
    CrewFlow().kickoff()


def plot():
    CrewFlow().plot()


if __name__ == "__main__":
    kickoff()
