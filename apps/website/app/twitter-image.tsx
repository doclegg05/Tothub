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
					fontSize: 56,
					background: '#111827',
					width: '100%',
					height: '100%',
					display: 'flex',
					textAlign: 'left',
					alignItems: 'center',
					justifyContent: 'flex-start',
					color: '#f9fafb',
					padding: '60px',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<div style={{ fontWeight: 800, color: '#38bdf8' }}>TotHub</div>
					<div style={{ fontSize: 28, marginTop: 10, color: '#d1d5db' }}>
						Modern daycare operations, simplified
					</div>
				</div>
			</div>
		),
		{
			...size,
		}
	)
}



