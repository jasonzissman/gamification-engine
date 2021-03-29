# Performance Testing

## Building the JMeter Docker image
`docker build -t jmeter-gamification:latest .`

## Running the JMeter Docker image
`docker run jmeter-gamification -n -t gamification-engine-load-test-1.jmx -l output.csv -o output`

