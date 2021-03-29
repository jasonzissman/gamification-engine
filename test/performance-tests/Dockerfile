# Docker image for JMeter

FROM java:11

ARG JMETER_VERSION=”5.4.1"

RUN cd /opt \
    && wget https://apache.osuosl.org//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz \
    && tar xzf apache-jmeter-${JMETER_VERSION}.tgz \
    && rm apache-jmeter-${JMETER_VERSION}.tgz

RUN ln -s /opt/apache-jmeter-${JMETER_VERSION}/bin/jmeter /usr/local/bin

ENTRYPOINT ["jmeter"]
#CMD jmeter