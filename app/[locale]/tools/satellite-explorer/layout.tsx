import Head from './head';
 
export default function ToolsLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
	return (
		<>
			<Head params={params} />
			<main>
				{children}
			</main>
		</>
	);
}
