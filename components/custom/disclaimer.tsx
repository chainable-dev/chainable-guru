import { DisclaimerComponent } from "@rainbow-me/rainbowkit";

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => {
	return (
		<div>
			<h2>Disclaimer</h2>
			<Text>
				By connecting your wallet, you agree to our{" "}
				<Link href="https://chainable.co/terms">Terms of Service</Link> and
				acknowledge that you have read and understand our{" "}
				<Link href="https://chainable.co/privacy">Privacy Policy</Link>
			</Text>
		</div>
	);
};

export default Disclaimer;
