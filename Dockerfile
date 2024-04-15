FROM conda/miniconda3
RUN conda create -n env python=3.8
RUN echo "source activate env" > ~/.bashrc
ENV PATH /opt/conda/envs/env/bin:$PATH


WORKDIR /pymobilenav

RUN pip install flask

COPY . .

EXPOSE 3838

CMD ["python", "./MobileNav.py"]