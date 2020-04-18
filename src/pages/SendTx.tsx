import * as React from "react";
import { ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatAmount, validateInputAddresses, hexEncode } from "../libs/helpers";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import Button from "../components/Button";
import Container from "../components/Container";
import Input from "../components/Input";
import { sendTx } from "../actions";

const SendTx = styled.div`

`;

export default (): ReactElement => {

	const dispatch = useDispatch();

	const storage = useSelector((state: any) => {
        return {
			privateKey: state.app.privateKey,
			balance: state.app.balance,
			currentAddress: state.app.currentAddress,
			transactions: state.app.transactions,
			sending: state.app.sending,
        };
	});

	const { register, handleSubmit, errors } = useForm();
	
	const onTransactionSent = (data) => {
		const fee = 0.0000001;
		const to = data.destination;
		let amount = formatAmount(data.amount);
		amount = amount === storage.balance ? amount-fee : amount;
		const payload = data.message !== "" ? "0x"+hexEncode(data.message) : "0x";
		dispatch(sendTx(storage.privateKey, { amount, to, payload }));
	}

	return (
		<SendTx>
			<Container>
			<form onSubmit={handleSubmit(onTransactionSent)}>
				<Input
					name="destination"
					label="Destination address *"
					type="text"
					placeholder="enter destination address here"
					ref={register({
						validate: destination => validateInputAddresses(destination),
					})}
					error={errors.destination ? "Insert valid destination address" : ""} />
				<Input
					name="amount"
					label="Amount *"
					type="text"
					placeholder="0.1"
					ref={register({
						validate: amount => {
							amount = formatAmount(amount);
							return amount > 0 && amount <= storage.balance;
						},
					})}
					error={errors.amount ? `Insert valid amount.` : ""} />
				<Input
					name="message"
					label="Attach custom message to your transaction (e.g. receipt id)"
					type="textarea"
					ref={register()}
					error={errors.message ? "Insert valid message" : ""} />
				<Button disabled={storage.sending} type="submit" text="Send" margin="center"/>
			</form>
			</Container>
		</SendTx>
	);
}
