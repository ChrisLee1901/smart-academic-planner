import { MantineProvider, createTheme, Container, Title, Text } from '@mantine/core';

// Import CSS cơ bản
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Container py="xl">
        <Title order={1}>Smart Academic Planner</Title>
        <Text>Ứng dụng đang được phát triển...</Text>
      </Container>
    </MantineProvider>
  );
}

export default App;
