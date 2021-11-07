<label class="switch">
	<input type="checkbox" />
	<span class="slider round" />
</label>

<style>
	.switch {
		position: relative;
		display: inline-block;
		width: 40px;
		height: 22px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--theme-button-gray);
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 14px;
		width: 14px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.2s;
		transition: 0.2s;
	}

	input:checked + .slider {
		background-color: var(--blue);
	}

	input:focus + .slider {
		box-shadow: 0 0 1px var(--blue);
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(17px);
		-ms-transform: translateX(17px);
		transform: translateX(17px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 1rem;
	}

	.slider.round:before {
		border-radius: 1rem;
	}
</style>
