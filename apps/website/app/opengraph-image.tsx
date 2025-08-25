import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
	width: 1200,
	height: 630,
}

export const contentType = 'image/png'

export default function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 64,
					background: '#0ea5e9',
					width: '100%',
					height: '100%',
					display: 'flex',
					textAlign: 'left',
					alignItems: 'center',
					justifyContent: 'flex-start',
					color: 'white',
					padding: '60px',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontWeight: 800 }}>TotHub</div>
					<div style={{ fontSize: 32, marginTop: 12 }}>
						Daycare Management Platform
					</div>
				</div>
			</div>
		),
		{
			...size,
		}
	)
}



