VIETNAM NATIONAL UNIVERSITY OF HO CHI MINH CITY

THE INTERNATIONAL UNIVERSITY

SCHOOL OF COMPUTER SCIENCE AND ENGINEERING

**FinSight: A Microservices-Based Decision Support System for Long-Term Stock Investment Strategies**

By

Vu Hong Quang

A thesis submitted to the School of Computer Science and Engineering

in partial fulfilment of the requirements for the degree of

Bachelor of Computer Science

Ho Chi Minh City, Vietnam

2026

**FinSight: A Microservices-Based Decision Support System for Long-Term Investment Strategies**

APPROVED BY:

\___\___\___\___\___\___\___\___\___\___\__  
Nguyen Van Sinh, Ph.D., Chair

\___\___\___\___\___\___\___\___\___\___\__  
(_Typed Committee name here_)

\___\___\___\___\___\___\___\___\___\___\__  
(_Typed Committee name here_)

\___\___\___\___\___\___\___\___\___\___\__  
(_Typed Committee name here_)

\___\___\___\___\___\___\___\___\___\___\__  
(_Typed Committee name here_)

THESIS COMMITTEE  
(Whichever applies)

# ACKNOWLEGMENTS

First of all, I would like to thank Assoc. Prof. Nguyen Van Sinh for his help and guidance when I wrote this thesis. His guidance, support and inspiration were essential to the successful completion of this project.

I also want to thank MSc. Thai Trung Tin for his technical help and all the useful conversations we had while I was doing my research. His thoughts helped me learn a lot.

I appreciate the faculty members at the school Computer Science at International University. I am particularly grateful Dr. Le Du Tan, my academic advisor, for his constant support from the beginning stages of my study.

**TABLE OF CONTENTS**

[ACKNOWLEGMENTS 3](#_Toc227715383)

[ABSTRACT 9](#_Toc227715384)

[CHAPTER 1: INTRODUCTION 10](#_Toc227715385)

[1.1 Overview 10](#_Toc227715386)

[1.2 Problem Statement 10](#_Toc227715387)

[1.3 Scope and Objectives 11](#_Toc227715388)

[1.4 Assumption and solution 12](#_Toc227715389)

[1.5 Structure of thesis 13](#_Toc227715390)

[CHAPTER 2: LITERATURE REVIEW 15](#_Toc227715391)

[2.1 Valuation models in fundamental analysis 15](#_Toc227715392)

[2.1.1 Dividend Discount Model (DDM) 15](#_Toc227715393)

[2.1.2 Multiples Based Valuation 16](#_Toc227715394)

[2.1.3 Discounted Cash Flow (DCF) Models 16](#_Toc227715395)

[2.1.4 Residual Income (RI) Models 18](#_Toc227715396)

[2.1.5 Net Asset Value (NAV) 19](#_Toc227715397)

[2.2 Multi Criteria Decision Making (MCDM) Methods in Finance 20](#_Toc227715398)

[2.2.1 Analytical Hierarchy Process (AHP) 20](#_Toc227715399)

[2.2 Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) 22](#_Toc227715400)

[2.2.3 AHP-TOPSIS Hybrid Framework for Investment Analysis 24](#_Toc227715401)

[2.3 Existing Applications and Platforms 25](#_Toc227715402)

[2.3.1 Stock Rover 26](#_Toc227715403)

[2.3.2 GuruFocus 26](#_Toc227715404)

[2.3.3 Seeking Alpha 26](#_Toc227715405)

[2.3.4 Finviz 26](#_Toc227715406)

[2.3.5 TradingView 27](#_Toc227715407)

[2.3.6 Yahoo Finance 27](#_Toc227715408)

[2.3.7 DNSE ENTRADE X - ENSA (Vietnam) 27](#_Toc227715409)

[CHAPTER 3: METHODOLOGY 29](#_Toc227715410)

[3.1 Overview 29](#_Toc227715411)

[3.2 Use Case Diagram 29](#_Toc227715412)

[3.2.1 Actor: Users (Investors) 31](#_Toc227715413)

[3.2.2 Actor: Administrators (System Owners) 31](#_Toc227715414)

[3.2.3 Actor: Market Data 31](#_Toc227715415)

[3.2.4 Actor: Email Service 31](#_Toc227715416)

[3.2.5 Actor: Payment Gateway 31](#_Toc227715417)

[3.3 User requirement analysis 32](#_Toc227715418)

[3.3.1 Functional Requirements 32](#_Toc227715419)

[3.3.2 Non-Functional Requirements 33](#_Toc227715420)

[3.4 System Architecture Diagram 34](#_Toc227715421)

[3.5 Sequence Diagram 37](#_Toc227715422)

[3.5.1 Login/Register Sequence 37](#_Toc227715423)

[3.5.2 Subcription Payment Sequence 39](#_Toc227715424)

[3.6 Database 42](#_Toc227715425)

[3.7 Algorithm 43](#_Toc227715426)

[3.7.1 Analytical Hierarchy Process 44](#_Toc227715427)

[3.7.2 Technique for Order of Preference by Similarity to Ideal Solution 45](#_Toc227715428)

[3.7.3 AHP-TOPSIS Hybrid Framework for Investment Analysis 47](#_Toc227715429)

[3.8 Data Analysis and Investment Recommendation Framework 50](#_Toc227715430)

[3.8.1 Data Collection and Processing Pipeline 50](#_Toc227715431)

[3.8.2 Valuation Model Computation 51](#_Toc227715432)

[3.8.3 Multi-Criteria Decision Analysis 53](#_Toc227715433)

[3.8.4 Investment Recommendation Generation and Delivery 54](#_Toc227715434)

[CHAPTER 4: IMPLEMENTATION AND RESULTS 56](#_Toc227715435)

[4.1 Development Tools and Technologies 56](#_Toc227715436)

[4.1.1 Programing Language 56](#_Toc227715437)

[4.1.2 Frontend Technologies 56](#_Toc227715438)

[4.1.3 Backend Technologies 56](#_Toc227715439)

[4.1.4 Messaging and Communication Technologies 57](#_Toc227715440)

[4.1.5 Database Technology 57](#_Toc227715441)

[4.2 Investment Strategy Backtest 57](#_Toc227715442)

[4.2.1 Methodology 57](#_Toc227715443)

[4.2.2 Data and Limitations 58](#_Toc227715444)

[4.2.3 Results 59](#_Toc227715445)

[4.2.4 Robustness Analysis 60](#_Toc227715446)

[4.3 System Performance Evaluation 61](#_Toc227715447)

[4.3.1 Test Environment and Methodology 61](#_Toc227715448)

[4.3.2 Response Time Analysis 63](#_Toc227715449)

[4.3.3 Error Rate and System Capacity 67](#_Toc227715450)

[4.4 Results and Screenshots 68](#_Toc227715451)

[4.4.1 Core Analytical Modules 68](#_Toc227715452)

[4.4.2 System Support Features 72](#_Toc227715453)

[Chapter 5: Discussion and Evaluation 76](#_Toc227715454)

[5.1 Introduction 76](#_Toc227715455)

[5.2 Discussion of Valuation Model Selection and Implementation 76](#_Toc227715456)

[5.3 Discussion of AHP-TOPSIS Framework Implementation 77](#_Toc227715457)

[5.4 Comparative Evaluation Against Existing Platforms 78](#_Toc227715458)

[Chapter 6: Conclusion and Future Work 80](#_Toc227715459)

[6.1 Conclusion 80](#_Toc227715460)

[6.2 Future Work 81](#_Toc227715461)

[6.2.1 AHP Consistency Ratio Enforcement 81](#_Toc227715462)

[6.2.2 Advanced MCDM Methods 81](#_Toc227715463)

[6.2.3 Automated Financial Data Ingestion 81](#_Toc227715464)

[6.2.4 AI and Machine Learning Integration 82](#_Toc227715465)

[6.2.5 Infrastructure Scaling and SaaS Deployment 82](#_Toc227715466)

[6.2.6 Feature Extensions and Backtesting 82](#_Toc227715467)

[REFERENCES 83](#_Toc227715468)

LIST OF FIGURES

[Figure 1: Structure of thesis 14](#_Toc227715174)

[Figure 2: Stock Valuation Models \[1\] 15](#_Toc227715175)

[Figure 3: UseCase Diagram 30](#_Toc227715176)

[Figure 4: System Architecture Diagram 35](#_Toc227715177)

[Figure 5: Login/Register Sequence Diagram 38](#_Toc227715178)

[Figure 6: Subscription Payment Sequence Diagram 41](#_Toc227715179)

[Figure 7: Entity Relationship Diagram 43](#_Toc227715180)

[Figure 8: Mean Latency as Load Increases 63](#_Toc227715181)

[Figure 9: Median Latency as Load Increases 64](#_Toc227715182)

[Figure 10: 90th Percentile Latency as Load Increases 64](#_Toc227715183)

[Figure 11: 95th Percentile Latency as Load Increases 65](#_Toc227715184)

[Figure 12: Minimum Latency as Load Increases 65](#_Toc227715185)

[Figure 13: Maximum Latency as Load Increases 66](#_Toc227715186)

[Figure 14: Error Rate as Load Increases 67](#_Toc227715187)

[Figure 15: Dashboard Page 69](#_Toc227715188)

[Figure 16: StockScanner Page 70](#_Toc227715189)

[Figure 17: Stock Details Page 71](#_Toc227715190)

[Figure 18: Portfolio Allocator Page 72](#_Toc227715191)

[Figure 19: Login Page 73](#_Toc227715192)

[Figure 20: User Profile & AHP Configuration Page 74](#_Toc227715193)

[Figure 21: Admin Panel Page 75](#_Toc227715194)

LIST OF TABLES

[Table 1: Functional Requirements 33](#_Toc227715195)

[Table 2: Non-Functional Requirements 34](#_Toc227715196)

[Table 3: Pseudocode Analytical Hierarchy Process (AHP) 45](#_Toc227715197)

[Table 4: Pseudocode TOPSIS 47](#_Toc227715198)

[Table 5: Pseudocode AHP-TOPSIS Hybrid Method 50](#_Toc227715199)

[Table 6: Backtest Configuration 58](#_Toc227715200)

[Table 7: Annual Portfolio Value, Returns, and Drawdown versus VN-Index 59](#_Toc227715201)

[Table 8: Performance Metrics Summary (N = 4 annual returns, 2021–2024) 59](#_Toc227715202)

[Table 9: Method Comparison (identical harness, alternative ranking schemes, 2020–2024, top-N = 4) 60](#_Toc227715203)

[Table 10: CAGR Distribution across 100 Weight-Perturbation Trials 61](#_Toc227715204)

[Table 11: Comparative evaluation of FinSight against existing platforms 79](#_Toc227715205)

# ABSTRACT

In the modern dynamic financial markets, people and organisations are required to invest in order to accumulate wealth, to secure assets against inflation and to attain long-term financial objectives. Nevertheless, investors may fail to perform extensive fundamental analysis based on either time constraints, use of short-term indicators or information overload. Most existing tools are orientated to short-term trading and do not capture the true value of firms, so non-professional investors can hardly get valuable information.

FinSight is a long-term stock investment strategy decision support system based on microservices that I propose in this thesis. The framework deals with the issue of scalability, modularity, and usability of financial data processing. The methodology consists of three key elements: (1) gathering and pre-processing data on financial reports and the market using real-time MQTT connections and Apache Kafka event streaming; (2) using basic valuation models, such as the Dividend Discount Model (DDM), Discounted Cash Flow (DCF), Residual Income (RI), and financial ratios, including P/E, P/B, and P/CF; and (3) using decision-making techniques. The AHP (Analytical Hierarchy Process) uses user-specified pairwise comparison matrices to derive personalised weights of criteria, whereas TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) ranks stock options based on their similarity to ideal solutions across a set of criteria. This is a hybrid method that allows customised investment advice but is mathematically rigorous.

To prove the proposed architecture, it was validated using a prototype that was applied to real stock data of publicly traded companies and was found to allow automatic data ingestion, provide accurate valuation calculations and visualise information through the use of interactive dashboards. As is evident from the results, this solution simplifies investment decisions, reduces the information overloading and supports wealth-creating policies in the long term. We are convinced that microservices and multi-criteria decision-making algorithms may be successfully utilised in fintech solutions and the pathway to the scalable and intelligent investment platform is opened.

# CHAPTER 1: INTRODUCTION

## Overview

Investment today is a key that matters a lot to individuals and institutional investors to raise funds against inflation to realise long-term economic objectives. In the current dynamic financial markets, the investment role is not in personal gain; it is a pillar to economic development and sustainable development, as it helps allocate resources efficiently and supports job creation and innovation. As the world becomes globalised in terms of capital markets and the digital revolution of financial services, the amount and complexity of financial data have exponentially increased. Today, investors do not have to struggle with the lack of information but rather must process extensive data produced by the financial reports and stock markets daily.

With such a volume of data, investors, particularly those with limited time or experience, are struggling to process such data to arrive at a decision. Traditional investment instruments usually focus on short-term trading indicators, such as technical lines and price movements, which can be helpful in speculation. However, contemplating the fundamental value of companies is often futile. Thus, investors will be forced to put their money at stake to make investment choices using incomplete or distorted information that may result in loss of money or opportunity. Furthermore, the interfaces of most existing platforms are complex and require professional expertise, which poses a challenge for investors who prefer long-term investments over short-term ones.

To overcome these problems, microservices are a viable solution due to the flexibility, reliability, and straightforward maintenance of large-scale systems or the ability to scale up future features. With the application of microservice in financial technology (fintech), there is an opportunity to create systems that combine basic analytical tools, reduce downtime and offer insights with a user-friendly interface. This will help close the gap between raw financial data and valuable investment decisions and allow accessibility and efficiency to a broad audience of users.

## Problem Statement

Although the financial markets are more open and accessible than ever, investors continue to encounter a lot of old-time barriers that inhibit them from making efficient decisions. Among the crucial problems is the ability to retrieve valuable information out of financial reports. Balance sheets, income statements and cash flow reports are very important data; it takes time and experience, however, to comprehend these documents. This is not possible for time-strapped or inexperienced investors. They typically do not analyse their information (i.e., revenue increase or debt ratios) but instead omit this process or rely on simplified summaries on the side of third parties.

The other concern is the design of the existing platforms. The majority of applications or websites available on the internet rely on technical analysis and trading signals such as moving averages, momentum indicators, or candlestick patterns... which can be valuable to traders that are interested in short-term trading but not to assess the true value of the companies. Individual stock investors who access these platforms are motivated to follow trends over building sustainable and basic wealth-creation strategies.

Lack of data integration is another problem. The data on the company's performance is scattered in a multitude of sources (regulatory filing, market feeds, financial news, analyst reports). It is tedious to combine them all manually, and error-prone which results in incomplete analysis and investment decision making. Without a system that can automatically analyse these sets of data, investors miss out on important information, which increases the risk of overlooking crucial details.

The combination of those problems creates a gap. On the one hand, investors require a tool that facilitates and handles data from numerous sources. Conversely, the existing platforms are too complex, too speculative or too inflexible. This is a big disadvantage to the retail investor who lacks time and experience and is forced to work with whichever platform is given. These investors will make decisions using incomplete or misleading information without other solutions to use.

Thus, the main issue that should be addressed in this thesis is the lack of scalability and user-friendly UI that could analyse the value of the company effectively. The solution required is a system capable of automatically mining data out of final reports and organising data using basic valuation methods in a stable and transparent manner and sharing the outputs with users using an API and a user-friendly interface for non-professional users. By covering these deficiencies, the thesis will offer relief from information overload and diversion of speculative signals and offer practical assistance to long-term decision-making by the investors.

## Scope and Objectives

This thesis focuses on designing and implementing a microservices-based system to provide the basic investment analysis of listed stocks. The structure will be mindful of long-term valuation approaches as opposed to short-term trading approaches. Public stock exchange reports will be the primary source of data, including balance sheets, income statements, and cash flow statements. They will be limited to stocks exclusively and not other asset classes like bonds, commodities, or cryptocurrencies, which may need very different modelling strategies.

The systems will apply typical valuation models, such as comparisons with other companies of the same industry; Price to Earnings (P/E), Price to Book (P/B), Earnings Per Share (EPS), revenue growth, Dividend Discount Model (DDM), Discounted Cash Flow (DCF), ... These are popular indicators that are trusted and utilised by capital market players.

In technical terms, the system will be developed using Java Spring Boot to process data and analysis; services to accept user requests will be built using TypeScript and Apache Kafka will be used as a backbone of messaging and event streams, which will allow asynchronous communication and scalable data pipelines. To create a user-friendly UI, ReactJS and Tailwind CSS will be used, MySQL will hold structured financial and user data, and Redis will be implemented to create a cache that will handle requests quicker.

The scope is also involved with the creation of prototypes as proof of concept. Even though scalability and modularity are considered, other features such as full-scale real-time integration with APIs or even strict compliance with regulatory standards are not in the scope of this thesis in the short term.

The thesis is aimed at designing, implementing and assessing a scalable structure to find out the actual worth of the business. Specific goals are:

- System Design: Develop a modular architecture separating data collector, analysis and visualization, gateway, supported by Kafka for asynchronous distributed events.
- Data processing: Create a pipeline to processed financial reports, save structured results in a MySQL database.
- Evaluation Models: Use key metrics such as P/E, P/B, EPS, revenue growth, DDM, DCF…
- Backend and Frontend: Use Spring Boot for heavy computations, TypeScript for handling requests from users, and ReactJS/Tailwind CSS for making UI.
- Prototype Evaluation: Test on datasets of listed companies to assess accuracy, usability, and performance.

By fulfilling these objectives, the thesis will demonstrate how microservices and event-driven architecture can be more accessible, scalable and user-orientated in assessing the intrinsic value of companies.

## Assumption and solution

The thesis presupposes an environment of realistic financial conditions where small institutions and retail investors should have a dependable instrument to measure the underlying value of publicly traded corporations. Assumptions are that financial reports match price. Data in the system are identical to stock exchanges or corporate disclosures. This makes sure that the system's input is consistent and reliable for further analysis.

It is also assumed that the system is operating in a distributed or cloud-based environment, where microservices can operate autonomously since they interact with each other via asynchronous Kafka topics. The investors will communicate with the system primarily via a web interface, whereas developers or analysts can do so via APIs. As this work is a prototype, it is also presumed that the scope is not extensive enough to do more than core analysis and visualisation rather than to do complete regulatory compliance or global integration.

The solution is a microservices-based system that approximates intrinsic company value, which is optimised to process structured financial data. After extraction, the financial data is saved in MySQL and cached with Redis. Apache Kafka is an asynchronous streaming distributed event platform, which allows scalable communication between services asynchronously.

The analytical services will calculate the company valuation based on the following methods: P/E, P/B, EPS, revenue growth, DDM, and DCF... Java Spring Boot will be used to manage heavy computational tasks, and TypeScript to process user requests and responses. The results of the processing are exposed via APIs and made available to the user using a ReactJS frontend with Tailwind CSS styles, rendering interactive and dynamic dashboards.

## Structure of thesis

The remainder of this thesis is organized into six chapters as follows:

- Chapter 1. Introduction: This chapter provides the general background for the thesis, outlines the problem statement, scope, goals, assumptions, and the proposed solution. It also presents the general structure of the thesis.
- Chapter 2. Literature Review: This chapter reviews existing research papers, applications, economic analysis, and microservices. The strengths and boundaries of the current solutions are analysed to identify research gaps, as the purpose of this thesis is to address.
- Chapter 3. Methodology (Proposed Method): This chapter presents the design of the proposed system. This includes the details of the system architecture, UML diagrams (use case, sequence, and ERD), and descriptions of the evaluation methods applied.
- Chapter 4. Implementation and Results: This chapter describes the implementation details, including programming languages, frameworks, and directory structure. This prototype configuration, screenshots of the developed application, and the obtained results.
- Chapter 5. Discussion and Evaluation: This chapter discusses the results in detail, comparing the proposed framework with related work reviewed in Chapter 2. Strengths, weaknesses, and limitations of the system are analysed.
- Chapter 6. Conclusion and Future Work: In this chapter, the key findings and contributions of the thesis are described. Some potential future work such as scaling the system, adding more features, and incorporating sophisticated AI prediction models are presented.
- References: All papers, books, and online sources cited in the thesis are listed in this section, formatted.

Figure 1: Structure of thesis

# CHAPTER 2: LITERATURE REVIEW

## 2.1 Valuation models in fundamental analysis

Valuation of the stock is based on different methods/models, such as the Dividend Discount Model (DDM), multiples-based models, Discounted Cash Flow (DCF) models, Residual Income (RI) models, and Net Asset Value (NAV) approaches. As per literature stated that, each model uses a different set of assumptions with their advantages and disadvantages.

Figure 2: Stock Valuation Models \[1\]

### 2.1.1 Dividend Discount Model (DDM)

In determining the worth of a stock, the Dividend Discount Model (DDM) analyses the flow of future dividend payments, as expected. The point is that the intrinsic value of a stock is equal to the present value, of all the expected future dividends. This model is rational since it makes a direct connection between valuation and shareholder returns. However, the DDM has several limiting assumptions: it assumes that the company will operate forever, that the rate of growth in dividend will be constant, that the required rate of return will be constant and that the market will correctly price the stock based on expected dividends \[1\] \[2\]. In reality, these assumptions are often not true. Indicatively, there are numerous companies that even do not pay a dividend or do it only periodically and it is impossible to predict a dividend all the time. Bodie et al. (2009) point out that although the DDM is theoretically correct, it is not realistic to project an infinite stream of dividends \[2\]. When any company even postponingly suspends the payment of dividends, the pure DDM finds itself ineffective in valuation \[1\] \[2\]. Accordingly, the advantages of the DDM are that it is logical and focused on cash returns through dividends and disadvantages are that it is only applicable to companies with stable dividend policies and is sensitive to assumptions related to dividends.

General model for the DDM:

_Where V­­­<sub>0</sub>: value per share of stock_

_D: expected dividend per share_

_K: required return rate on the stock or discount rate._

### 2.1.2 Multiples Based Valuation

Practitioners commonly use relative valuation based on ﬁnancial multiples because it is easy to use and provides a fast benchmark to market prices. Examples are the price to earnings (P/E), price to book (P/B), EV/EBITDA and price to sales ratios. These models are based on the assumption that the value of a stock can be deduced by the pricing of similar companies on a specific measure. As an illustration, the P/E model presumes that the fair price of a stock is a multiple of its earnings, according to industry standards. Multiples are popular due to their convenience and the reason that they reflect the current market sentiment \[1\]. P/E belongs to the modern investment lingo and is common in equity research \[1\]. Multiples, however, have serious drawbacks. They are informal and may be less strict. Wafi et al. (2015) observe that multiples-based valuations are less precise and objective compared to the DCF-based estimates \[1\]. Multiples implicitly presuppose that there is at least a semi-efficient market in order to have a comparison basis. They also fail when the target firm's fundamentals don't match its peers or when short-term earnings are negative (P/E can't be used when earnings are negative). In brief, multiples are handy to make fast relative checks and simple to communicate, but they sacrifice rigour and are misleading when used alone. They have the advantage of speed and market realism but the disadvantage of lacking a theoretical basis; they determine what the market is prepared to pay for similar assets, not the intrinsic value. It can be formulated as follows:

Where P/E ratio: market price of the stock / Earnings per share

EPS­<sub>1</sub>: expected earnings per share for the next period.

### 2.1.3 Discounted Cash Flow (DCF) Models

DCF is regarded as one of the most theoretically reasonable valuation methods. The intrinsic value of a firm (or its equity) in a DCF represents the present value of the future cash flow (excluding stock options) that is likely to be generated by a business, discounted at the relevant cost of capital. The method is based on the fundamental concept that the value of any asset is the present value of all the future cash flows that are expected to be paid in the future and discounted at the required rate \[1\] \[2\]. DCF may be applied through a model, such as a two-stage or multistage growth model, that applies free cash flow forecasts and a terminal value. DCF's main advantage is its thoroughness: it considers all factors that affect a company's value \[3\]. It is not based on market pricing for peers, such as multiples, and compels the analyst to analyse fundamentals (revenues, costs, growth, and capital needs) in detail. The DF approach, however, does not have a few real-life issues. A study has established that the input assumptions of DCF have a significant effect on the DCF results, especially in the discount rate and the long-term growth or terminal value projections. Even minor variations in the assumed weighted average cost of capital (WACC) or in the estimated cash flows can lead to significant variations in the estimated value. According to Vayas Ortega et al. (2020), one of the largest issues with DCF is its extreme sensitivity to the estimates of cash flow and WACC \[4\]. Similar to DDM, DCF models tend to use a constant discount rate and long-run stable growth. Risk profile and required returns may vary with time in the real world. In addition, although finance theory glorifies DCF, research studies have shown that the practice does not always manifest itself in practitioners. Penman (1992) found that, despite the conceptual importance of DCF, its practical use is unclear and less common than it should be \[5\]. To conclude, the advantage of DCF is that it is founded on a sound financial theory and is comprehensive in the sense that it values all cash flows; the disadvantage is that it relies heavily on uncertainties and assumptions. The model is appropriate in companies where there is certainty of cash flows, and even in this case, the model is usually complemented with other techniques because estimates are not certain. DCF is determined by the following formula \[1\]:

Where

FCFF: Free Cash Flow to the Firm

EBIT: Earnings Before Interest and Taxes

Tc: Tax Rate

WACC: Weighted Average Cost of Capital

V<sub>T</sub>: Terminal Value

T: Final year

t: Individual year

### 2.1.4 Residual Income (RI) Models

An alternative, which mitigates some of the shortcomings of DDM and DCF, is the residual income approach (also called the Ohlson model, after the seminal work by Ohlson (1995)). The RI model begins with the concept that the intrinsic value of a company can be calculated based on its book value and earnings by taking the present value of future residual incomes (of the company) plus its current book value. Residual income is defined as the profit remaining after deducting the cost of equity capital, which is calculated as profit minus a capital charge on the book value. The formulation by Ohlson connected the market value of a firm to the book value of equity and the present value of the expected future abnormal earnings \[6\]. The model is based on the DDM, but rather than directly predicting cash flows or dividends, it predicts earnings and bases its predictions on accounting book value. The residual income model's benefit is that the company need not issue dividends. You can still determine the company's value by comparing its earnings with the book value. It also de-emphasises terminal values, which are difficult to estimate, because the current book value and near-term earnings represent a major portion of the value. Empirical research largely supports the RI approach as a valid methodology for valuation. Bernard (1994) and Penman and Sougiannis (1998) found out that stock prices can be best explained by residual income-based valuations rather than by short-horizon DCF or dividend models \[7\] \[8\]. Frankel and Lee (1998) also demonstrated that the residual income method (theirs based on the earnings projections of analysts and book values) was a more complete valuation than most traditional approaches \[9\]. According to Dechow et al. (1999), the RI model provides more validated valuations as compared to DDM or DCF on their sample \[10\]. The RI model's practical strength is that it can be implemented even in markets that are not fully efficient. The residual income model, as opposed to DCF or DDM, does not need to be implemented in efficient financial markets, so it can be applied in emerging markets or less efficient markets \[1\]. Wafi et al. (2015), in a systematic review, echoed it, finding that the Residual Income Model was the most plausible and reliable in the stock valuation of both developed and emerging markets \[1\], namely, because it does not assume that the market is strong. That is, RI is able to give a fair estimate of intrinsic value although market prices are temporarily out-of-line because it uses basic accounting metrics to value them \[1\]. The advantages of the RI model include, therefore, that it is based on accrual accounting information (which may be more predictable than cash flows) and it is less reliant on assumptions about long-term growth rates.

RI models do possess limitations, however. The simple Ohlson (1995) model is parsimonious; it simply takes book value and earnings and applies the linear information dynamic to the dynamics of earnings. Practically, the analysts might be required to add additional value drivers (such as R&D, intangibles, and macro factors) to obtain more precise valuations. Ohlson's framework alone is not fully comprehensive for analysis because it omits some non-financial data and economic variables that could influence value \[6\]. The model has been expanded with other information variables by researchers, though it involves the use of judgement and economic intuition. The other weakness is that RI models, as with DCF, still involve the need to make a forecast (of future earnings and book values) and an assumption regarding how much the abnormal earnings will persist. The model may not be so reliable in cases of poor quality or volatile earnings. However, there is a common perception in the literature that residual income (and its alternative, the residual earnings/economic value-added models) is an important complement to DCF. It is particularly effective for firms that do not pay dividends, have cash flows that are difficult to determine, and whose valuation is linked to accounting measures that managers actively monitor. With these in mind, it is not surprising that Wafi et al. (2015) identified RIM as the most plausible model in general when it comes to predicting stock prices among the tools of fundamental analysis. The equation is:

Where

: Stock prices in the period t

: Stock book Values in period t and t-1

: Expected value from operations conditional information at period t

Firm earnings at period t

Discount rate

### 2.1.5 Net Asset Value (NAV)

Another valuation approach that is commonly applied as a sanity check, or in specific cases, to certain asset-rich companies is the Net Asset Value approach. NAV (sometimes called 'asset-based valuation') is a valuation of a company calculated as the net worth of its assets less liabilities on the company balance sheet; it effectively is the book value or liquidation value of a company. This method is based on the assumption that the intrinsic worth of the company is the same as the value of underlying assets under an orderly sale. NAV may apply to the holdings of a company, investment trust, or firm where the assets are readily marketable (e.g., real estate portfolios). Its advantage is that it gives a floor valuation and a company cannot be valued below the amount it would fetch in a situation where the assets are sold (Burgstahler and Dichev (1997) observe that the book value is in fact the liquidation value of the assets \[11\]). Accounting data is also relatively straightforward to calculate NAV from. But NAV is very restricted as a tool of going-concern valuation. It disregards the future earning capability of the assets; for example, a company with high growth prospects will be worth much more than its book value, while a company that destroys value may trade below its book value. Generally, NAV overstates the value of profitable firms (because it ignores intangible assets, brand value, human capital, and so on) and understates the value of distressed firms (which may not fetch book values in a fire sale). Therefore, although NAV is not regularly applied as a stand-alone method to going concerns, it belongs to the basic analytical arsenal as a conservative yardstick. NAV is determined as below:

## 2.2 Multi Criteria Decision Making (MCDM) Methods in Finance

Multi-Criteria Decision Making (MCDM) techniques provide a systematic approach to appraising investments where a set of, and possibly conflicting, criteria, including risk, return, liquidity and valuation ratios, are to be assessed together. Unlike single-model valuation techniques in Section 2.1, MCDM techniques combine both quantitative indicators and expert judgement to (i) generate criterion weights and (ii) rank alternatives. The most popular include the Analytic Hierarchy Process (AHP), which generates consistent weights through pairwise comparisons; TOPSIS, which ranks options by closeness to an ideal solution; and hybrid AHP-TOPSIS systems that use AHP to provide weights and TOPSIS to provide rankings to support transparent and repeatable decisions in equity analysis and decision support systems.

### 2.2.1 Analytical Hierarchy Process (AHP)

The Analytic Hierarchy Process (AHP) is a systematic multi-criteria decision-making method that was introduced in the 1980s by Saaty to enable the decision-makers to deal with complex problems that have many factors. The decision problem in AHP is represented in a hierarchy (e.g., goal, criteria, subcriteria, alternatives), and the decision-makers make pairwise comparisons to obtain the weights of each criterion and alternative. In the pairwise comparison, the level of importance of two items in relation to each other is expressed on the 1 to 9 ratio scale developed by Saaty. Importantly, this scale does not place any global picture of ranking and demands specific numbers to every criterion; every two comparisons are rated separately, an identical value can be entered a number of times and equal significance is registered as 1 where necessary. Multiple comparisons scoring the same (such as three 6s) or having different pairs scoring 8 or 9 is not incorrect. The judgement matrix is designed to be reciprocal (as the scoring of criterion A is 5 over B, B is 1/5 over A). The strengths of AHP are that it has an intuitive structure and can be used to integrate qualitative and quantitative factors; it offers a consistency test of judgements, which is important in financial applications where subjective measures (e.g., opinions of experts on risk factors) must be confirmed. This has made AHP be applied extensively in financial decision-making, particularly in portfolio and investment analysis \[12\]. An example is Bahmani et al. \[13\], who were one of the first to use AHP for investment selection, demonstrating that AHP can be useful to deal with a variety of investor-specific factors (e.g., wealth, experience, and risk tolerance) and concluding that it is an excellent tool to deal with complex investment decisions. Later works supported the usefulness of AHP: Charouz and Ramik \[14\] used AHP in portfolio management and discovered that it facilitated taking into account practical constraints and criteria when making decisions regarding the allocation of assets. Such and other applications demonstrate that AHP can improve the accuracy and transparency of the investment analysis process by organising the process of valuation around simple factors and the preferences of investors. Although AHP is a popular technique, it has issues. It relies on individuals drawing comparisons, introducing subjectivity and the potential of inaccuracy. Ensuring the judgement matrix is always identical may be difficult in the presence of more criteria and the pairwise comparison process can be complex. Studies have observed that in cases where the criteria are interdependent (as is the case with finance, where liquidity and risks are likely to be correlated), the rigid hierarchy of AHP and its independence assumption can increase unreliable outcomes. In this instance, more sophisticated forms such as the Analytic Network Process (ANP) are proposed to deal with criterion interdependence or hybrid methods. A different well-known problem is rank reversal, wherein the addition or removal of alternatives can alter the ranking of the available alternatives; although there are ways to reduce this, it is a controversial weakness of AHP. In general, AHP has its strength in the derivation of weights since it offers a systematic method of establishing the relative significance of financial criteria (e.g., cash flow, earnings growth, credit rating) using the expertise of the participants. However, alone AHP does not prioritise alternatives except to produce weightings; once that is done, some other method is frequently required to assess and rank the investment alternatives. This scenario is where one can merge AHP with a complementary approach with the strength of each technique.

Analytical Hierarchy Process (AHP) - General Mathematical Formulas \[12\]:

- Pairwise Comparison Matrix

, , ,

- Priority Vector (Eigenvector Method)

- Consistency Measures

- Local Weights of Alternatives (per Criterion )

- Global Priority of Alternatives

(or matrix form)

Where a<sub>ij</sub>: relative importance of element versus (Saaty scale).

A: Pairwise comparison matrix for criteria or alternatives.

w: Normalized priority vector.

: Maximum eigenvalue of matrix .

CI: Consistency Index.

CR: Consistency Ratio.

RI: Random Index (Saaty).

: Pairwise matrix of alternatives under criterion .

: Local priority vector of alternatives given criterion .

: Weight vector of criteria.

: Global weight (final priority) of alternative .

: Matrix of alternatives’ local weights across all criteria_._

### 2.2.2 Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)

Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) is a ranking technique used in multicriteria developed by Hwang and Yoon (later explained by Chen and Hwang \[13\]) as a ranking method. TOPSIS assumes the existence of an ideal (the best possible levels of each criterion) and a negative ideal (the worst levels) solution to each decision problem. The alternatives are evaluated by calculating their distances to the ideal points in the criteria space, and each alternative receives a score based on its relative proximity to the ideal. The one which is nearest to the ideal solution (and the most distant to the negative ideal) in distance is placed first. One of the strengths of TOPSIS is that it is computationally simple and efficient – the steps to follow are the same, irrespective of the size of the set of alternatives, thereby making it suitable for ranking large sets of investment choices. In contrast to AHP, which calculates the weights of criteria by pairwise comparisons, TOPSIS as a rule accepts the weights of the criteria as an entrance and concentrates on the ranking of alternatives. Financially, TOPSIS can quickly rank instruments (i.e., stocks, bonds, portfolios, etc.) in order of the best to the worst investment choice based on pre-determined criteria weight (e.g., importance of P/E ratio, debt level, ROI, etc.). Indicatively, Alptekin \[14\] used TOPSIS to compare the performance of mutual funds in Turkey, where the funds were ranked according to various financial statistics and could identify the best-performing funds. A multicriteria method (including TOPSIS) was also employed by Bouri et al. \[15\] to select the most suitable stock portfolios and it was demonstrated that TOPSIS is able to rank risk and returns simultaneously. Its approach is sound and comprehensible, as it is simple and grounded on objective distance measurements. The stakeholders can readily find out the reason behind the ranking of a given stock above another. The quality of TOPSIS rankings, conversely, is very sensitive to the quality of the inputs and, in particular, the selection and weighting of the criteria. Since TOPSIS does not assign weights, it should be based on an opinion of an expert or any other technique like AHP. Any prejudice or error in such weights will have an immediate influence on the outcome. TOPSIS is also based on the assumption that criteria are either steadily increasing or decreasing (more/less is better) and it does not take into account the possibility of criteria interacting in a complex manner. Two financial criteria being highly correlated or non-linear preference behaviour may result in the Euclidean distance measure in standard TOPSIS giving a misleading view of the true performance of an alternative. Such drawbacks have been addressed by the proposal of extensions by researchers. An example here is that a correlation between financial indicators can give a more valid ranking by the use of Mahalanobis distance in TOPSIS. The other weakness is that TOPSIS gives a ranking but does not give a definite cut-off in the selection of the best alternatives to be invested in; the decision-makers must still determine how to select the best-ranked alternatives to be invested in. Despite these disadvantages, TOPSIS has demonstrated its usefulness in finance since it can easily be integrated with decision support systems and can compute distances on real-time data (e.g., recalculating distances as financial measures vary). It has found application in credit risk assessment, portfolio decisions, and corporate finance decision-making, where it often can demonstrate high decision quality as compared to primitive single-measure rankings \[14\] \[16\]. The survey of Velasquez and Hester singles out TOPSIS as an excellent tool that can be used to supplement other MCDM techniques in complex decisions due to its simplicity and effectiveness balance \[16\].

The Technique for Order Preference by Similarity to Ideal Solution (TOPSIS) is described using general mathematical formulas \[17\]:

- Decision Matrix

- Normalized Decision Matrix (Vector Normalization)

- Weighted Normalized Matrix

- Positive and Negative Ideal Solutions

- Separation Measures

- Relative Closeness to the Ideal Solution

Where: : Performance value of alternative on criterion .

: Normalized performance value.

: Weight of criterion ,

: Weighted normalized value.

: Set of benefit criteria.

: Set of cost criteria.

: Positive and negative ideal solutions.

: Distances from positive and negative ideal solutions.

: Relative closeness coefficient of alternative .

### 2.2.3 AHP-TOPSIS Hybrid Framework for Investment Analysis

With the complementary characteristics of AHP and TOPSIS, a hybrid AHP-TOPSIS framework has become a common MCDM method of financial decision support. Under this combined approach, the weights of the evaluation criteria (reflecting the preferences of the decision-maker or the expertise of the expert on what is most important) are first calculated using AHP, and TOPSIS is then applied to rank the investment alternatives using these weights. This two-step method is based on the strength of AHP in pairwise comparison and TOPSIS in ranking. According to numerous studies, these hybrid models enhance the results of decisions in finance. Indicatively, Mahmoodzadeh et al. \[15\] showed that the AHP (to compute weight) plus TOPSIS (to make final selection) produced more consistent project investment decisions as compared to either method. A similar AHP-TOPSIS hybrid was used on portfolio selection by Karimi Joughi \[18\], where the criteria such as profitability, risk, and liquidity were weighted using AHP and ranking portfolio alternatives using TOPSIS; an optimal stock portfolio was determined which was subsequently tested using real market data. The hybrid approach in both instances offered a more rigorous and systematic assessment procedure, pointing to superior performance to ad hoc and single-method analyses. Indeed, comparative studies by Pätari et al. \[19\] showed that both AHP- and TOPSIS-based models performed well in solving equity portfolio selection problems (among other MCDM techniques), which highlights that the AHP-TOPSIS methodology is comparable to state-of-the-art techniques in the identification of high-performing investments. The fact that the AHP-TOPSIS model can be automated and integrated into decision support systems is one of the main benefits of the framework in the financial systems. The systematic character of AHP (with its specific phases of acquiring criteria weights) and the algorithmic transparency of TOPSIS (with its non-random ranking process) imply that the whole process can be summarised in software modules. In fact, researchers have created integrated decision support systems based on these methods; Xidonas et al. \[20\], e.g., created a multicriteria portfolio selection system (IPSSIS) that integrates optimisation and decision analysis to guide investors. Similarly, an AHP-TOPSIS-powered module in a microservices-based investment platform can be used to automatically collect basic data, rank the financial indicators based on hierarchies defined by experts, and rank investment options to use in long-term strategies. This mixed method can be used to make more informed and defensible investment decisions: it can give an accountable explanation (through the weights and consistency ratios of AHP) as to why particular criteria are prioritised and an objective ranking (through the closeness scores of TOPSIS) which can be revised as circumstances evolve. Additionally, the AHP-TOPSIS approach incorporates human judgement and computational rigour to consider the qualitative aspects of investments and their quantitative performance.

## 2.3 Existing Applications and Platforms

In long-term stock investing fintech, systems are becoming more automated in gathering data, fundamental ratios, and portfolio management to minimise information overload and enhance accessibility. However, most offerings focus on monolithic interfaces that are feature-rich as opposed to modular, API-first architectures, limiting scalability and real-time integration as compared to distributed microservices. This summary has reviewed some selected systems, i.e., Stock Rover, GuruFocus, Seeking Alpha, Finviz, TradingView and Yahoo Finance, with an intent to find out their merits and demerits and the existing gap to justify the decision support system based on microservices architecture. Basic valuation serves as the theoretical basis upon which these tools implement screening, estimation of fair value and diagnosis of risks \[21\].

### 2.3.1 Stock Rover

Stock Rover focuses on dividend, value, and growth investors by providing a powerful screener that includes over 650 metrics, 10 years of fundamental data, margin of safety and fair value calculations, as well as portfolio analysis integrated into most major brokerages. Its main benefits to long-horizon strategies include extensive historical coverage, intrinsic value approximations that are automated and spreadsheet-free, and investor-friendly screeners based on canonical strategies. The trade-offs are a focus on North American markets, basic technical charting compared to specialist TA sites, and first experience with a web app. In general, Stock Rover offers detailed fundamental screening and dividend analysis that can be used by long-term investors.

### 2.3.2 GuruFocus

GuruFocus builds on basic analysis with long historical time series, value investing toolkits, and unique guru portfolio tracking using 13F filings and its own constructs (GF Score and GF Value) to encode financial health, profitability, growth, momentum, and valuation in one heuristic. Its strong points are abnormally rich history (typically 10 - 30 years), extensive worldwide coverage, specialised value screens, and backtesting facilities that support hypothesis creation of patient, fundamental-driven strategies. The limitations of GuruFocus include high costs, complexity for new users, delays in guru data due to filing lags, and a lack of transparency about its proprietary scoring system. There is little public technical information on the proprietary scoring and data processing pipelines.

### 2.3.3 Seeking Alpha

Seeking Alpha combines crowdsourced research with systematic factor scoring through its Quant Ratings and supplements this with author and Wall Street consensus ratings, transcripts of earnings calls, and dividend safety measures, providing a variety of valuation, quality, and revision views. The breadth of coverage, the ability to interrogate bullish and bearish theses, and the ability to track the performance of authors archivally are all useful to long-term investors of the platform. Some of the risks are the heterogeneous quality of the articles, paywalled analytics, and the possibility of conflict between contributors. Though content and factor engines are rich, paywalls and platform boundaries can limit integration into external workflows, which may hinder long-term investors from fully utilising the available resources and insights for their investment strategies.

### 2.3.4 Finviz

Finviz focuses on fast understanding by high-performance visualisations and a fast screener with fundamental and technical filtering, heat maps of market structure, and trending signals that are better suited to fast triage and discovery of ideas. In long-term investing, it has the advantages of being a fast, simple, and practical ratio-based filtering of U.S. equities, facilitating efficient narrowing of candidate sets. The limitations are a relatively small underlying depth as compared to research-centric sites, lack of international coverage, outdated UI paradigms, and delayed quotes without the Elite tier. Public information on deeper data coverage and export facilities is less, which may diminish its suitability to research workflows that demand an extensive range of model-ready fundamentals.

### 2.3.5 TradingView

The TradingView platform provides ultra-fast charting with more powerful fundamental overlays, worldwide market access, and Pine Script to programmable analytics, allowing users to create custom indicators that blend financial statements and price series. Its comparative advantages are community-driven extensibility, multi-symbol fundamental charting and extensive broker connectivity, which combine to aid hypothesis generation and monitoring across markets and asset classes. Nonetheless, basic tooling is still secondary to technical analysis; more detailed prebuilt valuation workflows and industrial-grade data management are constrained compared to expert research suites. Despite a vibrant ecosystem, its capabilities are still charting and community scripts; ready-to-use basic valuation workflows are still relatively scarce.

### 2.3.6 Yahoo Finance

Yahoo Finance offers the easiest on-ramp and strong free levels, easy fundamentals, important ratios, and portfolio sync useful to students and retail investors who need a basic level of coverage without specialised tools. The advantages are ubiquity, easy navigation, and the incorporation of third-party research in paid levels. Shortcomings: depth and originality – few valuation models beyond partner content; uneven geographic coverage; premium research scattered rather than grouped into programmatically accessible components. Not a complete research backbone but a starting point for intensive valuation.

### 2.3.7 DNSE ENTRADE X - ENSA (Vietnam)

ENSA is a DNSE Securities-constructed chatbot within the Entrade X platform responding to investor queries in Vietnamese and providing brief, ratio-based stock summaries. Formal user documentation defines the scope of ENSA to include core investment and market updates; thus, a common interaction with long-term investors would be a request about the fundamentals and valuation context of a particular ticker instead of free-form exploration of AI. The press coverage also describes ENSA as a chatbot, which answers and offers investment ideas directly in the broking app, and it is fast and convenient to use by domestic users. The fundamentals-first viewpoint, at a long horizon, is the value of ENSA in its ability to reduce familiar metrics into a readable paragraph: valuation multiples like P/E and P/B with historic and industry comparisons; growth-adjusted valuation via PEG as implied by EPS growth; profitability through ROE and ROA; balance sheet leverage through D/E; cash flow quality through operating cash flow; dividend yield.

# CHAPTER 3: METHODOLOGY

## 3.1 Overview

This chapter introduces the methodology and system design of the FinSight Decision Support System for long-term stock investment strategies. I fully describe the system architecture, including use case diagrams that describe the functionality of users and administrators, sequence diagrams that show workflows in authentication and payment, and the entity relation diagram that describes the database schema. The microservices are based on an architecture that includes real-time data collection based on DNSE Socket, fundamental analysis calculation using various valuation models (DCF, DDM, and Residual Income) and the AHP-TOPSIS multicriteria decision-making model. The system uses Apache Kafka to stream events, Redis to store data in caches, MySQL to store data in persistent storage, and HAProxy to load balance to ensure scalability, reliability, and efficient delivery of data to support evidence-based investment decisions.

## 3.2 Use Case Diagram

TThe UseCase diagram gives a pictorial view of the interactions between the actors and the system and the functions that the FinSight Decision Support System must be capable of to enable long-term stock investment strategies using fundamental analysis.

Actors**:** Users (Investors), Admin (System Owner), Payment Gateway, Market Data, Email Service.

Figure 3: UseCase Diagram

### 3.2.1 Actor: Users (Investors)

The main actors of the FinSight Decision Support System are the users, who include retail investors and small institutional investors who would like to make informed long-term investment choices informed by fundamental analysis. Under the Authentication & Profile module, the user is able to create an account, which will automatically send a welcome email confirmation to log in to the system, and can update his or her personal profile details. Users can search stocks and have a personal watchlist by adding and removing stocks of interest with the Stock Search & Watchlist module and access detailed stock information. The AHP-TOPSIS analysis module allows users to maintain their AHP setup (including the calculation of criteria weights); see the stock scores obtained with the help of the AHP-TOPSIS approach (including ranking of stocks); and distribute their portfolio according to the ranked results. Moreover, users can also manage their subscription plan, reviewing their existing plan and processing subscription payments, which are fully compatible with the payment gateway to process the transactions safely and confirm them.

### 3.2.2 Actor: Administrators (System Owners)

Administrators are internal actors of the FinSight Decision Support System responsible for maintaining platform integrity and overseeing backend operations. Within the User Administration module, administrators can manage all registered accounts by viewing user details, editing account information, and deleting users when necessary for security or policy compliance. Administrators are also responsible for Stock Administration, where they can manage stock records through viewing, editing, and deleting existing stocks, as well as uploading annual stock data to ensure the system reflects accurate and up-to-date financial information for fundamental analysis.

### 3.2.3 Actor: Market Data

Market Data is an external participant that is the major source of data in the FinSight Decision Support System. It then starts the Update Stock Prices use case that then automatically calls upon the Recalculate Valuations process via an &lt;<include&gt;> relationship to make sure that all the stock assessment and fundamental analysis in the system is based on the latest market information. Valuation adjustments that satisfy specific criteria may trigger a recalculation process that may send an email to the user about substantial changes of interest to their watchlist or portfolio.

### 3.2.4 Actor: Email Service

Email Service is an outsourced service that manages all outbound email communication in the FinSight decision support system. It can assist in various notification situations, such as sending welcome mails when a user registers, alert mails when recalculations of stock valuation are made, and mails of payment confirmation when a successful subscription is made. The purpose is so that users are aware of all the critical system events and activities in their accounts.

### 3.2.5 Actor: Payment Gateway

A payment gateway is an outsourced entity which handles all payment-related functions in the subscription management module. Upon the activation of the Pay Subscription use case by a user, the Payment Gateway will create QR codes and checkout links to complete subscription payments in an &lt;<include&gt;> relationship. When a transaction is completed, the Payment Gateway receives payment webhooks, which can be extended to send a payment confirmation that verifies the transaction and updates the user's subscription status in the system.

## 3.3 User requirement analysis

The FinSight platform aims to help retail and small institutional investors bridge the gap of complicated raw financial data and turn it into useful long term investment ideas. The system uses a microservices architecture to make sure that scalability and reliability in financial data processing.

### 3.3.1 Functional Requirements

Functional requirements define what specific tasks the system must carry out in order to accomplish the goals of fundamental investment analysis and administrative oversight.

|     |     |     |
| --- | --- | --- |
| ID  | Requirement Name | Description |
| FR1 | Core Valuation Calculation | The system must calculate intrinsic company value using key fundamental analysis ratios, including Price to Earnings (P/E), Price to Book (P/B), Earnings Per Share (EPS), Return on Equity (ROE), and revenue growth. |
| FR2 | Advanced Valuation Models | The system must have the ability able to calculate and show results from well-known valuation models like the Dividend Discount Model (DDM) and the Discounted Cash Flow (DCF) models. |
| FR3 | MultiCriteria Recommendation | The system shall apply the AHP-TOPSIS multicriteria decision making framework to generate prioritized investment scores and recommendations based on multiple valuation criteria. |
| FR4 | Data Collection | The system needs to automatically collect and analyse data from trusted market sources, such as DNSE MQTT Socket and financial reports. |
| FR5 | Stock Search and Triage | Users must be able to search for specific stocks using a ticker symbol or company name and view detailed stock information including fundamental financial data. |
| FR6 | Stocks Monitoring (Watchlist) | Users must be able to add stocks to a private watchlist for ongoing monitoring and remove stocks from the watchlist when no longer needed. |
| FR7 | User Authentication & Profile | The system must support user registration with email confirmation, secure login using JSON Web Token (JWT), and allow users to view and edit their personal profile information. |
| FR8 | Subscription Management | The system must support a full subscription workflow, including viewing current subscription status, initiating payment via QR code through PayOS, processing incoming payment webhooks, and sending payment confirmation to activate or renew premium features. |
| FR9 | Admin User Management | For security or policy reasons, administrators must be able to see detailed user information, change accounts, and delete user accounts when necessary. |
| FR10 | Admin Content Management | Administrators must be able to view, edit, and delete existing stock records, as well as upload annual stock year data to maintain database accuracy and integrity. |

Table 1: Functional Requirements

### 3.3.2 Non-Functional Requirements

Non-functional requirements address the performance, security, scalability, and usability qualities necessary for the robust operation of the microservices based Decision Support System.

|     |     |     |
| --- | --- | --- |
| ID  | Requirement Name | Description |
| NFR1 | Scalability and Modularity | The architecture must use microservices and an event driven architecture (via Apache Kafka) to ensure scalability for handling growing data in real-time, maintainability for future features, and independent deployment of components. |
| NFR2 | Performance and Caching | The system must ensure high performance for data delivery. To get response times less than a millisecond for frequent requests, the market-rest needs to make querying Redis for cached data a top priority. |
| NFR3 | Load Balancing | HAProxy must be set up as a reverse proxy and load balancer to handle user requests. This will ensure that market-rest instances are always available and that resources are used in the most efficient way possible. |
| NFR4 | Usability and Accessibility | The system needs to have a user friendly and interactive user interface (UI) that was made with ReactJS and Tailwind CSS. This will allow non-professional users to get to the processed financial information and focus on long term fundamentals. |
| NFR5 | Security | JWT based authentication and secure encrypted access through Cloudflare Tunnel (which protects against DDoS attacks) must be used to keep the system secure. |
| NFR6 | Data Integrity | Storing all structured financial data, historical prices, and user accounts in MySQL is necessary for the system to make sure that data is durable and reliable. |

Table 2: Non-Functional Requirements

## 3.4 System Architecture Diagram

The FinSight system uses a distributed microservices architecture that is used to process real-time stock market data, calculate fundamental analysis, and effectively deliver data to investors. It is constructed based on several key components that collaborate to create a scalable, reliable, and high-performance platform for investment decision support.

Figure 4: System Architecture Diagram

At the system entrance point, HAProxy is used as a reverse proxy and load balancer for the REST API service, whereby the user request is distributed among the multiple instances of the service to maintain high availability and maximum resource usage. This structure avoids bottlenecks and allows fault tolerance so that the system can deal with simultaneous requests from various investors effectively.

The TypeScript-based REST service serves as the main interface between the end-users and the back-end systems, giving preference to read operations, which first verify Redis with cached data. When the user is demanding the stock data or any of the valuation measures, the REST service checks Redis instantly with less than a millisecond response time. When the data is not present in the cache, like on the addition of new stocks or outdated data, the REST service contacts the Realtime Service to get new data in the MySQL database. This two-level data access plan maximises the performance besides guaranteeing the accuracy of data.

Apache Kafka serves as the main message broker and event streaming service that coordinates asynchronous communication between the Webhooks, Ingestion, Collector, Realtime, and other microservices. It delivers natural load balancing among service instances and guarantees message durability in case of failure.

The Webhooks is a Java-based service which receives PayOS payment notification callbacks when users transact subscription services. When the webhook service receives notifications about the payment success/failure, the service preprocesses the data and verifies the payment information and publishes the structured events to the Kafka topics. This preprocessing guarantees consistency of data and isolates payment event processing as compared to business logic processing, enabling the Realtime service to perform only basic computations.

The ingestion service is a Java-based service that offers the administrative data pipeline of loading the historical financial statements into the system. It opens a special REST endpoint to which administrators can upload Excel files, which are processed via Apache POI cell-by-cell, through which each worksheet is processed to obtain a set of per-stock financial indicators over multiple fiscal years, and each of the stock years is published as a structured Kafka message. This service is deliberately stateless, with no direct database connection, and all the persistence and following revaluation recalculation is delegated to the Realtime service through Kafka. It is a design that separates the data ingestion issue from business logic and has the advantage of having all uploaded financial data automatically computed in order to be valuated.

The Collector service connects and links to the DNSE socket through the MQTT protocol to get real-time updates on stock prices in the exchange. When tick data is received, it is preprocessed by the collector, which does validation and normalisation of the raw market data and publishes these events to Kafka topics. The processed data is in turn sent to both the socket server to deliver it immediately to the user and Kafka for the downstream processing by the Realtime service.

The computational core of the system is the Realtime service, which is an implementation of Java. It receives several Kafka topics to consume events of three upstream services: payment confirmation events on the Webhooks service, real-time price updates on the Collector service, and financial statement records on the Ingestion service. In the case of payment events, it synchronises the user subscription status and account details in MySQL. In the case of ingested financial data, it would maintain the received stock-year records in MySQL and would cause valuation recalculation of the relevant stocks. In the case of market data, it will access the stored financial statements on the MySQL database and do detailed calculating with valuation models such as P/E, P/B, DCF, DDM and residual income and use the AHP-TOPSIS multicriteria decision-making framework to create investment scores and recommendations. Once computations are done, the results of a real-time service are stored in both Redis and MySQL, which are used as fast caching and durable storage, respectively.

All structured financial data, such as historical stock prices, financial statements managed by administrators, user accounts, records of subscriptions and payment transactions, are stored in MySQL. Redis is a distributed in-memory cache, and the load on the database is greatly decreased by caching commonly used calculated metrics, whereby the REST service is able to process most requests without having to connect to MySQL.

The WebSocket server manages real-time WebSocket connections with users, receiving pre-processed price updates from the Collector and pushing changes instantly to connected clients. Users interact through a ReactJS web application via Cloudflare Tunnel, which provides secure encrypted access with DDoS protection and global CDN capabilities, ensuring reliable platform access while protecting backend services from direct internet exposure.

## 3.5 Sequence Diagram

### 3.5.1 Login/Register Sequence

The Login/Register sequence diagram shows the authentication process in the FinSight system, both user registration and user login processes, in four major components: Frontend, Backend, Database, and Email Service. The diagram illustrates the way the system handles the creation of user accounts and credential verification using a microservices architecture. The user enters the information during registration by the Frontend which sends the request to the Backend. The Backend makes a query to the Database to verify whether the email or username is already in existence. In case there is an absence of a record, the Backend will add the new user to the Database and activate the Email Service to send a registration confirmation mail. The Backend will then send a 201 Created response and the Frontend will redirect the user to the login page. In case the user is already in existence, the Backend will respond with a 400/401 error and the Frontend will show the error.

To log in, the user provides credentials via the Frontend that forwards the request to the Backend. The Backend checks the Database against the user record and checks the password. In case of a successful authentication, the Backend creates a JSON Web Token (JWT) and sends a response of 200 OK with the JWT. The Frontend caches the token and redirects to the target page. In case of authentication failure, because of invalid credentials or the user not existing, the Backend sends a response of 401/Error, and the Frontend shows the error.

This sequence diagram shows how the system architecture has clearly separated the concerns, with the Frontend dealing with user interaction, Backend dealing with business logic, Database dealing with persistent data, and the Email Service dealing with notifications. Stateless authentication is provided by the use of JWT tokens, which makes the system more scalable and secure.

Figure 5: Login/Register Sequence Diagram

### 3.5.2 Subcription Payment Sequence

The Subscription Payment sequence diagram shows the end-to-end payment processing process related to the FinSight system, which combines various third-party services and internal parts to ensure the safety of subscription transactions. The following diagram includes seven main elements: Frontend, Backend, Database, server PayOS (payment gateway), Merchant Bank, Customer Bank, and Mail Server, which illustrate how the system integrates complex payment processes based on a microservices architecture with third-party payment integration.

The ordering procedure starts as soon as the user makes an order with the Frontend interface. This order creation request is sent to the Backend by the Frontend and the order record is directly inserted into the Database, to ensure transaction persistence. The Backend subsequently uses the Server PayOS as the payment gateway to call the payment request. The Server PayOS takes a QR-Pay code and contacts the Merchant Bank to form a payment channel. The Merchant Bank responds with the QR-Pay information of the particular order back to Server PayOS, which is subsequently forwarded to the Backend. The Backend sends back the information on the payment to the Frontend which displays the QR-Pay code to the user so that it can be scanned and payment can be made.

When the payment is successful, it passes to a critical stage where the user scans the QR code with his/her banking application and initiates money transfer between the Customer Bank and the Merchant Bank. This transaction is processed by the Merchant Bank and the payment status is updated back to Server PayOS. Then Server PayOS notifies the Backend by sending a webhook notification that the payment is successful. This confirmation of payment is verified by the Backend, which further changes the status of the order in the Database to indicate a successful payment. The Backend then uses the Mail Server to send a payment confirmation email to the user to remind them of the subscription payment made. The Backend replies to the Frontend with a 200 OK reply and redirects the user to a success page, acknowledging the subscription activation.  
There are two critical failure situations, which the diagram also discusses in different frames. The historic behaviour of the Backend in the first failure case is that when the payment process creates an error at any point, the Backend will update the order status in the Database to indicate the error and send a response of 402 with the error back to the Frontend. The Frontend would then show the user the error, and it presents transparency on the failure of the transaction. The second case of failure is when the user actively rejects the order prior to payment. Here, Frontend requests the Backend to cancel the order, and this request is accepted, as the Backend modifies the status of the order in the Database and requests Server PayOS to cancel the payment to void the pending transaction. The Backend then replies with a "200 OK" to the Frontend which shows a cancel page to confirm the order cancellation.

Such a sequence diagram is an effective illustration of the sound payment architecture of the FinSight system, which can be characterised by the integration of external payment services (PayOS gateway) and banking services, as well as email notifications with internal microservices. QR-Pay technology is a new form of payment that is a secure, modern way of doing business in Vietnam and other markets in Southeast Asia. The fully developed error handling and order cancellation systems assure the integrity of the transaction and grant clear feedback to a user during the entire payment lifecycle. The asynchronous payment confirmation pattern of webhooks provides a stable processing of transactions in case of a temporary network outage, and the segregation of concerns among services increases the maintainability, scalability, and security of a given system on subscription-based revenue management.

Figure 6: Subscription Payment Sequence Diagram

## 3.6 Database

The design of the database prioritises efficiency in data retrieval and storage, thereby enhancing system performance and scalability in investment decision-making. It includes various entities, including user accounts, stock data, financial metrics, subscription details and customised decision criteria. Data integrity and consistency are maintained through the use of a relational database management system (RDBMS); indexing and query optimisation allow processing the financial analysis and valuation calculations in real time.

The User entity is the main entry point to the management of the system participants, such as investors and administrators. The UserId is the unique identifier of each user, and other attributes are UserName, Email, Password, PhoneNumber, IsAdmin (role indicator), and CreatedAt (date of registration). This entity encourages personalisation and access control throughout the system.

The StockInfo object, identified by its primary key, StockId, contains fundamental data on every security. The StockInfo object includes descriptive attributes (StockName, Sector, and MatchPrice), company-specific ratios (PERatio, PBRatio, PCFRatio, and PSRatio), and industry ratios (IndustryPeRatio, IndustryPbRatio, IndustryPcfRatio, and IndustryPsRatio) to facilitate comparative analysis of valuations between individual stocks and sector averages.

The StockYearData entity stores annual financial records of each stock in a one-to-many relationship with StockInfo with a composite key (StockId, Year). It stores time-series data such as valuation multiples (PE, PBV, PCF, PS), financial data (Revenue, NetIncome, FreeCashFlow, OperatingCashFlow, TotalEquity, Intangibles, SharesOutstanding, DividendPerShare) and intrinsic value model results (DCF, DDM, RI). The valuation framework is supported by parameters like CostOfEquity, WACC, DividendGrowthRate and PriceEndYear.

AhpConfig is a table that contains user-specific decision-making configurations with AhpConfigId (the primary key) and is associated with a user through UserId. It includes CriteriaJson, PairwiseMatrixJson and WeightsJson, which allow customised multi-criteria investment analysis according to personal preferences.

The Subscription table records the user access and service status, which is marked by SubscriptionId (primary key) and related to a user and a SubscriptionPlan through PlanId. It has properties such as StartDate, EndDate, Status, and an error message to track the transaction. The SubscriptionPlan entity determines service levels that have the attributes PlanName, Price, and BillingCycle, which allow the use of flexible monetisation strategies.

Lastly, the favourites relationship establishes a many-to-many connection between the User and StockInfo entities, allowing users to create personal lists of stocks for monitoring and analysis .

Figure 7: Entity Relationship Diagram

## 3.7 Algorithm

This paragraph introduces the algorithmic principles of the decision support mechanism of FinSight in three complementary computational units. The Analytical Hierarchy Process (AHP) algorithm is an algorithm that takes matrices of pairwise comparisons that are defined by users and calculates normalised weights of criteria, which measure the relative significance of valuation techniques in investment evaluation. The technique for order of preference by similarity to ideal solution (TOPSIS) algorithm is used to rank stock options based on their closeness to best and worst solutions based on a set of criteria. The AHP-TOPSIS Hybrid Framework is a combination of these two approaches in a single decision-making framework that incorporates subjective weight determination with objective multi-criteria ranking and allows personalised and systematic selection of a stock portfolio according to fundamental analysis.

### 3.7.1 Analytical Hierarchy Process

The input to the FinSight system is an AhpConfigEntity containing a JSON string representation of a pairwise comparison matrix which is then run through the Analytical Hierarchy Process (AHP) algorithm to give a JSON string representation of normalised weights as the output. It performs four consecutive calculation processes with a try/catch around translating any JsonProcessingException, either on parsing or serialisation operations, into a RuntimeException. Step 1 deserialises the input JSON to form a double\[\]\[\] array and identifies n as the dimension of the resulting matrix (the number of criteria) and verifies the shape of the array and throws an IllegalArgumentException when n = 0 (empty matrix) or when any row is null or has a different length than n (non-square matrix). In step 2, the geometric mean of each row is computed using the logarithm method to provide much greater numerical stability: each row i (0 to n-1) is processed by setting sumLog to 0 and then looping over all the columns j (0 to n-1), where again it is guarded against non-positive values in the matrix by throwing an IllegalArgumentException and accumulating log(matrix\[i\]\[j\]) into sumLog; the row geometric mean is then obtained as exp(sumLog / n). The 3rd step normalises the geometric means, adding them all together to get a total and throwing an IllegalStateException in the event total = 0 to avoid a degenerate result, followed by dividing each geometric mean by the total to obtain a weight vector the elements of which add to one. Step 4 ranks the weights array that has been obtained back to the format of a JSON array and returns it, which is then stored on the AHP configuration entity and used in the subsequent step by the TOPSIS ranking algorithm.

ALGORITHM AHP_WeightCalculation (recalcWeights)

INPUT:

\- ahpConfig: object containing pairwiseMatrixJson (JSON string of double\[\]\[\])

OUTPUT:

\- weightsJson: JSON string representation of normalized weights (double\[\])

THROWS:

\- IllegalArgumentException (invalid matrix shape or values)

\- IllegalStateException (degenerate result)

\- RuntimeException (JSON parse/serialize failure)

BEGIN

TRY

// Step 1: Parse JSON -> double\[\]\[\]

matrix = parse_json_to_matrix(ahpConfig.pairwiseMatrixJson)

n = length(matrix)

// Step 1a: Validate matrix is non-empty

IF n == 0 THEN

THROW IllegalArgumentException("Pairwise matrix is empty")

END IF

// Step 1b: Validate matrix is square (n x n)

FOR i = 0 TO n - 1 DO

IF matrix\[i\] == NULL OR length(matrix\[i\]) != n THEN

THROW IllegalArgumentException(

"Pairwise matrix must be square (n x n). " +

"Row " + i + " length = " +

(matrix\[i\] == NULL ? "null" : length(matrix\[i\]))

)

END IF

END FOR

// Step 2: Compute geometric mean of each row

// Using logarithm method for numerical stability

geoMeans = new array of size n

FOR i = 0 TO n - 1 DO

sumLog = 0.0

FOR j = 0 TO n - 1 DO

value = matrix\[i\]\[j\]

// Step 2a: Validate entries are strictly positive

IF value <= 0 THEN

THROW IllegalArgumentException(

"Pairwise matrix must contain only positive values. " +

"Found: " + value

)

END IF

sumLog = sumLog + log(value)

END FOR

// geometric mean = exp(average log)

geoMeans\[i\] = exp(sumLog / n)

END FOR

// Step 3: Normalize geometric means to get weights

total = 0.0

FOR i = 0 TO n - 1 DO

total = total + geoMeans\[i\]

END FOR

// Step 3a: Guard against degenerate sum

IF total == 0 THEN

THROW IllegalStateException("Sum of geometric means is zero")

END IF

weights = new array of size n

FOR i = 0 TO n - 1 DO

weights\[i\] = geoMeans\[i\] / total

END FOR

// Step 4: Serialize weights to JSON and return

weightsJson = serialize_to_json(weights)

RETURN weightsJson

CATCH JsonProcessingException AS e

THROW RuntimeException("Failed to parse or write AHP JSON", e)

END TRY

END

Table 3: Pseudocode Analytical Hierarchy Process (AHP)

### 3.7.2 Technique for Order of Preference by Similarity to Ideal Solution

The TOPSIS algorithm takes two inputs:a list of StockEntity candidates and a seven-element array of normalised AHP weights and produces a list of RankedStockDto objects sorted from best to worst alternative. After validating that the weights array contains exactly seven elements (one per criterion: DDM, DCF, RI, P/E, P/BV, P/CF, P/S) and that the stock list is non-empty, it executes seven sequential stages. In Step 1 a per-stock criteria row is built by the buildCriteriaRow subroutine, which discards any stock whose matchPrice is null or non-positive and computes the seven criteria with a uniform benefit-type transformation: the intrinsic-value criteria (DDM, DCF, RI) are expressed as intrinsicValue / matchPrice and the price-multiple criteria (P/E, P/BV, P/CF, P/S) are inverted into industryRatio / stockRatio, so that for every criterion a higher value indicates a more attractive stock; rows with fewer than two populated criteria are dropped, and the surviving rows form an m × 7 decision matrix together with a parallel list of eligible stocks. Step 2 normalises this matrix with the vector-normalisation method by computing each column's L2 norm as the square root of the sum of its squares and, when that norm is strictly positive, dividing every entry of the column by it; columns with a zero norm are left untouched. A deep copy of the normalised but pre-weighted matrix is retained for later tie-breaking. Step 3 forms the weighted normalised matrix in place by multiplying every entry by the AHP weight of its criterion. Step 4 identifies the ideal best and ideal worst solutions; because all criteria are already in benefit form after Step 1, the ideal best for each column is simply its maximum value and the ideal worst is its minimum, removing any need for a cost-versus-benefit branch. Step 5 computes, for every alternative, the Euclidean distance Sp to the ideal best and Sm to the ideal worst, derives the closeness coefficient as Sm / (Sp + Sm) (defaulting to zero when the denominator is zero), and rounds it to four decimal places so that ties become deterministic buckets. Step 6 establishes the final ordering with a three-level tie-breaker: alternatives are first sorted by rounded closeness score in descending order; remaining ties are resolved by walking the criteria in descending order of AHP weight (with the criterion index used as a deterministic secondary key) and comparing the pre-weighted normalised values from the snapshot taken in Step 2; any further ties are broken lexicographically by stockId. Step 7 materialises the ordering by emitting a RankedStockDto for each alternative, carrying its stockId, stockName, rounded topsisScore, and matchPrice, and returns the resulting list to the portfolio-allocation pipeline.

ALGORITHM TOPSIS_Rank

INPUT:

\- stocks: list of StockEntity

\- ahpWeights: double\[7\] (sum should be 1, but not enforced)

OUTPUT:

\- ranked: list of RankedStockDto sorted from best to worst

CONSTANTS:

NUM_CRITERIA = 7

// Criterion order: \[DDM, DCF, RI, PE, PB, PCF, PS\]

// All are benefit-type AFTER transformation in buildCriteriaRow.

BEGIN

IF stocks IS NULL OR empty THEN RETURN \[\]

IF ahpWeights IS NULL OR length(ahpWeights) != NUM_CRITERIA THEN

THROW IllegalArgumentException

END IF

// -------- Step 1: Build eligible set + criteria matrix --------

eligible = \[\]

rows = \[\]

FOR each stock IN stocks DO

row = buildCriteriaRow(stock) // see sub-routine below

IF row != NULL THEN

append stock TO eligible

append row TO rows

END IF

END FOR

IF eligible is empty THEN

log warning; RETURN \[\]

END IF

m = length(eligible)

matrix = rows as double\[m\]\[NUM_CRITERIA\]

// -------- Step 2: Vector normalization (in place) --------

FOR j = 0 TO NUM_CRITERIA - 1 DO

sumSq = 0

FOR i = 0 TO m - 1 DO sumSq += matrix\[i\]\[j\]^2

norm = sqrt(sumSq)

IF norm > 0 THEN

FOR i = 0 TO m - 1 DO matrix\[i\]\[j\] /= norm

END IF

// if norm == 0, column is left unchanged (all zeros)

END FOR

// Keep a copy of normalized-but-unweighted values for tie-breaking

normalizedOnly = deep_copy(matrix)

// -------- Step 3: Apply AHP weights (in place) --------

FOR i = 0 TO m - 1 DO

FOR j = 0 TO NUM_CRITERIA - 1 DO

matrix\[i\]\[j\] \*= ahpWeights\[j\]

END FOR

END FOR

// -------- Step 4: Ideal best / ideal worst (all benefit-type) --------

idealBest = array of -INFINITY, size NUM_CRITERIA

idealWorst = array of +INFINITY, size NUM_CRITERIA

FOR each row IN matrix DO

FOR j = 0 TO NUM_CRITERIA - 1 DO

IF row\[j\] > idealBest\[j\] THEN idealBest\[j\] = row\[j\]

IF row\[j\] < idealWorst\[j\] THEN idealWorst\[j\] = row\[j\]

END FOR

END FOR

// -------- Step 5: Closeness coefficient (rounded to 4 dp) --------

roundedScores = double\[m\]

FOR i = 0 TO m - 1 DO

sp = euclidean(matrix\[i\], idealBest)

sm = euclidean(matrix\[i\], idealWorst)

closeness = (sp + sm == 0) ? 0 : sm / (sp + sm)

roundedScores\[i\] = round(closeness \* 10000) / 10000

END FOR

// -------- Step 6: Tie-broken ordering --------

criterionOrder = indices \[0..6\] sorted by ahpWeights DESC,

ties broken by ascending index

order = \[0..m-1\] sorted by:

1\. roundedScores DESC

2\. for each col IN criterionOrder:

normalizedOnly\[\*\]\[col\] DESC

3\. stockId ASC (lexicographic)

// -------- Step 7: Build result --------

ranked = \[\]

FOR each idx IN order DO

s = eligible\[idx\]

append RankedStockDto{

stockId: s.stockId,

stockName: s.stockName,

topsisScore: roundedScores\[idx\],

matchPrice: s.matchPrice

} TO ranked

END FOR

RETURN ranked

END

SUBROUTINE buildCriteriaRow(stock) -> double\[7\] OR NULL

BEGIN

IF stock.matchPrice IS NULL OR stock.matchPrice <= 0 THEN RETURN NULL

price = stock.matchPrice

latest = year-data entry with the highest year, or NULL

row = \[0,0,0,0,0,0,0\]

populated = 0

// DDM, DCF, RI: intrinsic / price (benefit; >0 required)

IF latest != NULL AND latest.ddm > 0 THEN row\[0\] = latest.ddm / price; populated++

IF latest != NULL AND latest.dcf > 0 THEN row\[1\] = latest.dcf / price; populated++

IF latest != NULL AND latest.ri > 0 THEN row\[2\] = latest.ri / price; populated++

// PE, PB, PCF, PS: industryRatio / stockRatio (transformed to benefit)

IF stock.peRatio > 0 AND stock.industryPeRatio != NULL THEN row\[3\] = industryPe / pe; populated++

IF stock.pbRatio > 0 AND stock.industryPbRatio != NULL THEN row\[4\] = industryPb / pb; populated++

IF stock.pcfRatio > 0 AND stock.industryPcfRatio != NULL THEN row\[5\] = industryPcf / pcf; populated++

IF stock.psRatio > 0 AND stock.industryPsRatio != NULL THEN row\[6\] = industryPs / ps; populated++

IF populated < 2 THEN RETURN NULL // not enough data

RETURN row

END

Table 4: Pseudocode TOPSIS

### 3.7.3 AHP-TOPSIS Hybrid Framework for Investment Analysis

The AHP–TOPSIS hybrid is realised in FinSight as the orchestrator PortfolioAllocationServiceImpl.allocate, which composes two pre-existing algorithms: AHP_WeightCalculation and TOPSIS_Rank rather than recomputing them inline. It takes a single PortfolioAllocationRequest carrying a userId, a budget, a numberOfStocks, and an optional lotSize, and returns a ResponseDto wrapping either a PortfolioAllocationResult on success or a numeric error code with a human-readable message on failure. The orchestrator runs four sequential phases. Phase 1 validates the request: it rejects a null or non-positive budget with HTTP 400, rejects a non-positive numberOfStocks with HTTP 400, and substitutes a default lotSize of 100 when the supplied lot size is non-positive. Phase 2 loads the pre-computed AHP weights, it does not recompute them, because AHP_WeightCalculation runs at the time the user submits or updates a pairwise comparison matrix and persists the resulting weights as JSON on AhpConfigEntity.weightsJson; allocate retrieves the configuration through ahpConfigService.getAhpConfigByUserId, returns HTTP 404 if no configuration exists for that user, and parses weightsJson into a double\[\], returning HTTP 500 if deserialisation fails. Phase 3 fetches the candidate universe via stockRepository.findAllWithYearData(), returning HTTP 404 if the database yields no stocks. Phase 4 invokes TOPSIS_Rank(allStocks, weights), which builds a benefit-transformed criteria matrix (DDM, DCF, RI as intrinsicValue / matchPrice; P/E, P/BV, P/CF, P/S as industryRatio / stockRatio), filters out ineligible stocks (those with matchPrice ≤ 0 or fewer than two populated criteria), applies vector normalisation, multiplies by the AHP weights, computes the closeness coefficient Sm / (Sp + Sm), rounds it to four decimals, and returns a list of RankedStockDto objects sorted by score with deterministic three-level tie-breaking (rounded score, then unweighted-normalised values walked in AHP-weight-descending criterion order, then stockId); the orchestrator returns HTTP 404 if this list is empty. Finally, the ranked list is handed to portfolioAllocator.allocate, which performs lot-size-aware budget allocation across the top numberOfStocks candidates and produces the PortfolioAllocationResult returned to the caller. Because AHP weight derivation and TOPSIS ranking are decoupled in time and persistence weights are computed once per user and reused on every allocation request the hybrid output is the final PortfolioAllocationResult; the criteria weights and the score map are not returned alongside it, and any consumer that needs them must read them from the AHP configuration and the ranked DTOs respectively.

ALGORITHM AHP_TOPSIS_Hybrid (PortfolioAllocationServiceImpl.allocate)

INPUT:

\- request: { userId, budget, numberOfStocks, lotSize }

OUTPUT:

\- ResponseDto { success, data: PortfolioAllocationResult, errorCode?, errorMessage? }

CONSTANTS:

NUM_CRITERIA = 7

// Order: \[DDM, DCF, RI, PE, PB, PCF, PS\]

// All criteria are transformed to benefit-type inside buildCriteriaRow,

// so there is NO criteria_types / cost-vs-benefit branching in TOPSIS.

BEGIN

// -------- Validate request --------

IF request.budget IS NULL OR request.budget <= 0 THEN

RETURN errorResponse(400, "Budget must be positive")

END IF

IF request.numberOfStocks <= 0 THEN

RETURN errorResponse(400, "Number of stocks must be positive")

END IF

lotSize = (request.lotSize > 0) ? request.lotSize : 100

// -------- Phase 1: Load pre-computed AHP weights (NOT recomputed here) --------

ahpConfig = ahpConfigService.getAhpConfigByUserId(request.userId)

IF ahpConfig IS NULL THEN

RETURN errorResponse(404, "AHP config not found for user: " + request.userId)

END IF

TRY

weights = parse_json(ahpConfig.weightsJson) AS double\[\]

CATCH any exception

log error

RETURN errorResponse(500, "Failed to parse AHP weights")

END TRY

// Note: AHP weights were produced earlier by AHP_WeightCalculation

// (see ALGORITHM AHP_WeightCalculation below) and persisted on the entity.

// -------- Phase 2: Load universe --------

allStocks = stockRepository.findAllWithYearData()

IF allStocks is empty THEN

RETURN errorResponse(404, "No stocks available in the system")

END IF

// -------- Phase 3: TOPSIS ranking --------

ranked = TOPSIS_Rank(allStocks, weights) // see ALGORITHM TOPSIS_Rank

IF ranked is empty THEN

RETURN errorResponse(404, "No stocks have sufficient data for ranking")

END IF

// -------- Phase 4: Budget allocation over ranked list --------

result = portfolioAllocator.allocate(

ranked, request.budget, request.numberOfStocks, lotSize)

RETURN ResponseDto{ success: true, data: result }

END

// =============================================================

ALGORITHM AHP_WeightCalculation (AhpConfigServiceImpl.recalcWeights)

INPUT:

\- ahpConfig: entity with pairwiseMatrixJson (JSON of double\[\]\[\])

OUTPUT:

\- weightsJson: JSON of double\[\] (also persisted on the entity)

THROWS:

\- IllegalArgumentException, IllegalStateException, RuntimeException

BEGIN

TRY

matrix = parse_json(ahpConfig.pairwiseMatrixJson) AS double\[\]\[\]

n = length(matrix)

IF n == 0 THEN THROW IllegalArgumentException("Pairwise matrix is empty")

FOR i = 0 TO n - 1 DO

IF matrix\[i\] IS NULL OR length(matrix\[i\]) != n THEN

THROW IllegalArgumentException("Pairwise matrix must be square (n x n)")

END IF

END FOR

geoMeans = double\[n\]

FOR i = 0 TO n - 1 DO

sumLog = 0.0

FOR j = 0 TO n - 1 DO

v = matrix\[i\]\[j\]

IF v <= 0 THEN

THROW IllegalArgumentException(

"Pairwise matrix must contain only positive values. Found: " + v)

END IF

sumLog += log(v)

END FOR

geoMeans\[i\] = exp(sumLog / n)

END FOR

total = sum(geoMeans)

IF total == 0 THEN THROW IllegalStateException("Sum of geometric means is zero")

weights = double\[n\]

FOR i = 0 TO n - 1 DO weights\[i\] = geoMeans\[i\] / total

RETURN serialize_json(weights)

CATCH JsonProcessingException AS e

THROW RuntimeException("Failed to parse or write AHP JSON", e)

END TRY

END

// =============================================================

ALGORITHM TOPSIS_Rank (TopsisCalculator.rank)

INPUT:

\- stocks: List&lt;StockEntity&gt;

\- ahpWeights: double\[7\]

OUTPUT:

\- ranked: List&lt;RankedStockDto&gt; (sorted best -> worst)

BEGIN

IF stocks IS NULL OR empty THEN RETURN \[\]

IF ahpWeights IS NULL OR length(ahpWeights) != NUM_CRITERIA THEN

THROW IllegalArgumentException(

"AHP weights must have exactly " + NUM_CRITERIA + " elements")

END IF

// -------- Build eligible set + criteria matrix --------

eligible = \[\]

rows = \[\]

FOR each stock IN stocks DO

row = buildCriteriaRow(stock)

IF row != NULL THEN

append stock TO eligible

append row TO rows

END IF

END FOR

IF eligible is empty THEN

log warning "No stocks have sufficient data for TOPSIS ranking"

RETURN \[\]

END IF

m = length(eligible)

matrix = rows AS double\[m\]\[NUM_CRITERIA\]

// -------- Vector normalization (in place) --------

FOR j = 0 TO NUM_CRITERIA - 1 DO

sumSq = 0

FOR i = 0 TO m - 1 DO sumSq += matrix\[i\]\[j\]^2

norm = sqrt(sumSq)

IF norm > 0 THEN

FOR i = 0 TO m - 1 DO matrix\[i\]\[j\] /= norm

END IF

// if norm == 0, column is left unchanged (all zeros)

END FOR

// Snapshot of normalized-but-unweighted values, used later for tie-breaking

normalizedOnly = deep_copy(matrix)

// -------- Apply AHP weights (in place) --------

FOR i = 0 TO m - 1 DO

FOR j = 0 TO NUM_CRITERIA - 1 DO

matrix\[i\]\[j\] \*= ahpWeights\[j\]

END FOR

END FOR

// -------- Ideal best / ideal worst (all benefit-type) --------

idealBest = array of -INFINITY, size NUM_CRITERIA

idealWorst = array of +INFINITY, size NUM_CRITERIA

FOR each row IN matrix DO

FOR j = 0 TO NUM_CRITERIA - 1 DO

IF row\[j\] > idealBest\[j\] THEN idealBest\[j\] = row\[j\]

IF row\[j\] < idealWorst\[j\] THEN idealWorst\[j\] = row\[j\]

END FOR

END FOR

// -------- Closeness coefficient, rounded to 4 dp --------

roundedScores = double\[m\]

FOR i = 0 TO m - 1 DO

sp = euclidean(matrix\[i\], idealBest)

sm = euclidean(matrix\[i\], idealWorst)

closeness = (sp + sm == 0) ? 0 : sm / (sp + sm)

roundedScores\[i\] = round(closeness \* 10000) / 10000

END FOR

// -------- Tie-broken ordering --------

criterionOrder = indices \[0..NUM_CRITERIA-1\]

sorted by ahpWeights DESC, ties broken by ascending index

order = \[0..m-1\] sorted by:

1\. roundedScores DESC

2\. for each col IN criterionOrder:

normalizedOnly\[\*\]\[col\] DESC

3\. eligible\[\*\].stockId ASC (lexicographic)

// -------- Build result --------

ranked = \[\]

FOR each idx IN order DO

s = eligible\[idx\]

append RankedStockDto{

stockId: s.stockId,

stockName: s.stockName,

topsisScore: roundedScores\[idx\],

matchPrice: s.matchPrice

} TO ranked

END FOR

RETURN ranked

END

// =============================================================

SUBROUTINE buildCriteriaRow(stock) -> double\[7\] OR NULL

BEGIN

IF stock.matchPrice IS NULL OR stock.matchPrice <= 0 THEN RETURN NULL

price = stock.matchPrice

latest = year-data entry with the highest year, else NULL

row = \[0,0,0,0,0,0,0\]

populated = 0

// Benefit criteria - intrinsic / price (require >0)

IF latest != NULL AND latest.ddm > 0 THEN row\[0\] = latest.ddm / price; populated++

IF latest != NULL AND latest.dcf > 0 THEN row\[1\] = latest.dcf / price; populated++

IF latest != NULL AND latest.ri > 0 THEN row\[2\] = latest.ri / price; populated++

// Cost ratios transformed to benefit - industryRatio / stockRatio

IF stock.peRatio > 0 AND stock.industryPeRatio != NULL THEN row\[3\] = industryPe / pe; populated++

IF stock.pbRatio > 0 AND stock.industryPbRatio != NULL THEN row\[4\] = industryPb / pb; populated++

IF stock.pcfRatio > 0 AND stock.industryPcfRatio != NULL THEN row\[5\] = industryPcf / pcf; populated++

IF stock.psRatio > 0 AND stock.industryPsRatio != NULL THEN row\[6\] = industryPs / ps; populated++

IF populated < 2 THEN RETURN NULL // not enough data

RETURN row

END

// ========================================

// Notes (matched to actual implementation)

// ========================================

// 1. AHP and TOPSIS are decoupled in the codebase:

// - AHP_WeightCalculation runs when a user submits/updates a pairwise matrix;

// weights are stored as JSON on AhpConfigEntity.

// - TOPSIS_Rank runs per portfolio-allocation request, reading those weights.

//

// 2. There is NO criteria_types parameter. All 7 criteria are transformed into

// benefit-type inside buildCriteriaRow:

// DDM/DCF/RI -> intrinsicValue / matchPrice

// PE/PB/PCF/PS -> industryRatio / stockRatio

// Hence ideal_best is always max(column), ideal_worst is always min(column).

//

// 3. Eligibility filter (TOPSIS): a stock is dropped if matchPrice <= 0 or

// fewer than 2 of the 7 criteria are populated.

//

// 4. Closeness is rounded to 4 decimals BEFORE ranking, so tie-breaking sees

// rounded buckets.

//

// 5. Tie-breaking is three-level:

// (a) rounded TOPSIS score DESC,

// (b) normalized (pre-weight) values DESC, walked in AHP-weight-descending

// criterion order (ties broken by ascending criterion index),

// (c) stockId ASC.

//

// 6. Output of TOPSIS_Rank is a sorted List&lt;RankedStockDto&gt;, not a map.

// The score map / weights are NOT returned by allocate(); only the final

// PortfolioAllocationResult is.

//

// 7. Vector normalization edge: if a column's L2 norm is 0, the column is

// left untouched (all zeros), not replaced with a denominator of 1.

// ========================================

Table 5: Pseudocode AHP-TOPSIS Hybrid Method

## 3.8 Data Analysis and Investment Recommendation Framework

This section describes the analytical pipeline that transforms raw financial data into personalized investment recommendations through a systematic process integrating real-time data collection, fundamental valuation calculations, multi-criteria decision analysis, and intelligent ranking mechanisms. The framework combines market data acquisition via DNSE WebSocket API, intrinsic value estimation through multiple valuation models, user-specific preference integration via AHP-TOPSIS methodology, and recommendation delivery to support evidence-based investment decisions.

### 3.8.1 Data Collection and Processing Pipeline

The FinSight system adopts an effective data collection and processing pipeline that guarantees the quality of real-time market data and an in-depth historical financial analysis. The market collector microservice will be the main data collection unit, which will create a connection to the DNSE socket using the MQTT protocol to obtain real-time stock prices. This service, when receiving price update messages, performs two parallel operations: it publishes events in Apache Kafka topics to have them processed by downstream services and delivers the raw price data directly to the Socket server to be immediately sent by WebSocket connections to the connected user clients.

The management of historical financial data is based on another workflow aimed at ensuring the quality of data and administrative control. Administrators are also expected to enter new stock data and financial reports in the system using a special administrative interface. Financial statements: Balance sheets, income statements, cash flows and others are entered and stored in the MySQL database manually. This administrative workflow ensures that all financial information is processed manually before being included in the valuation calculations, thereby ensuring that the underlying data, which forms the basis of investment recommendations, is accurate and reliable.

The data validation and preprocessing is done at several levels within the system architecture to maintain analytical and computational stability. MySQL supports stringent data validation at the database layer, with structured schema management and referential integrity constraints, and it maintains consistency in all entity relationships. The administrators are crucial in keeping data clean by updating stock records and removing old records through the administrative interface. The system works on the premise that financial reports and matched price information are consistent with stock exchange reporting and corporate reporting, based on the authoritative nature of these sources. In algorithmic processing, preprocessing of data includes the use of the square root of the sum of squares to normalise vectors so that various criteria can be put on the same scale and meaningful cross-criteria comparisons made in ranking algorithms. The TOPSIS algorithm provides explicit treatment of non-finite values and zero denominators in the calculation of scores to avoid system crashes and to provide robust operation even when facing edge cases of financial data.

Apache Kafka is the key message broker and event streaming foundation of the microservices architecture, coordinating asynchronous traffic between the market-collector, market-realtime and market-rest services. Kafka offers natural load balancing between service instances with its consumer group feature and message durability in case of service unavailability, so that the information is not lost when a single microservice is temporarily unavailable. This event architecture allows the system to efficiently process real-time market data with loose coupling between services and to scale horizontally as the number of users grows.

### 3.8.2 Valuation Model Computation

The market-realtime microservice follows the full-scale computations of the valuation model with the help of retrieving the financial statements stored in the MySQL database and performing mathematical operations, which are based on a recognised financial theory. The system uses three main intrinsic valuation models to determine the stock values based on various perspectives of analysis and its results are saved as particular attributes within the StockYearData database entity to track its history and be able to compare the results with others.

The Dividend Discount Model (DDM) calculates intrinsic value based on the present value of all expected future dividends using the general formula presented in Section 2.1.1, where the cost of equity k is retrieved from the CostOfEquity field and dividend projections utilize the dividendGrowthRate parameter. The Discounted Cash Flow (DCF) model follows the comprehensive framework in Section 2.1.3, first calculating , then computing firm value as with terminal value , and finally deriving equity value and fair value per share through the formulas specified in Section 2.1.3. The Residual Income (RI) model implements the Ohlson (1995) framework from Section 2.1.4, calculating where abnormal earnings , with book value being retrieved in the Equity field, earnings in NetIncome, and discount rate in CostOfEquity in StockYearData.

Besides the intrinsic valuation models, the system calculates the key valuation ratios as described in Section 2.1.2 to support the relative valuation analysis and multiples-based comparisons. The Price to Earnings (P/E) ratio is calculated as P/E = Market Price/Earnings per Share, and Price to Book (P/B), Price to Cash Flow (P/CF), and Price to Sales (P/S) ratios are also calculated by dividing market price by their respective per-share ratios. In the case of asset-intensive companies, the system also calculates Net Asset Value using the formula in Section 2.1.5: . These ratios are included in both the StockInfo and StockYearData entities, which allows evaluating both the current snapshot analysis and the past trend evaluation on the basis of more than two fiscal periods.

.

The system takes industry standards to assist in undertaking comparative valuation studies of individual stocks and their counterparts in the sector. The StockInfo holding includes industry-specific benchmark ratios, including IndustryPeRatio, IndustryPbRatio, IndustryPcfRatio, and IndustryPsRatio, which allow users to evaluate whether or not a given stock trades at a premium or discount relative to industry ratios. The comparative element is a valuable addition to the analysis framework by providing sectoral background to each stock value.

The StockYearData table is established systematically with key financial parameters vital in the calculation of the valuation. The Cost of Equity parameter is used as the discount rate in the equity valuation models (DDM and RI) as it indicates what equity investors need to have as a return. The WACC (Weighted Average Cost of Capital) is a discount rate applied in calculating the DCFs and is the weighted average of the cost of debt and equity in the capital structure. The dividendGrowthRate parameter enables one to model future dividend flows and terminal values in perpetual models. The market-realtime service queries such parameters and past financial statements in MySQL, performs all calculation-based formulas according to Sections 2.1.1 through 2.1.5, and stores the results both in the Redis cache to access quickly and in MySQL to store them permanently, ensuring the consistency and mathematical correctness of the entire distributed microservices architecture.

### 3.8.3 Multi-Criteria Decision Analysis

The multi-criteria decision analysis model used in the FinSight system incorporates the user preferences and objective financial measurements through a combination of simultaneous use of the Analytical Hierarchy Process (AHP) system and the Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS) systems. This modelling enables customised investment recommendations that are flexible to the interests of separate investors, but the prioritisation is mathematically rigorous.

The weight calculation component is used to calculate normalised criteria weights, indicative of the relative significance of valuation factors, when using matrices of pairwise comparisons, which are defined by the user and stored in the AhpConfig entity. The matrices are created by users on the 1-9 scale developed by Saaty to compare two criterion pairs, e.g., DDM versus DCF or P/E versus P/B. Although Section 2.2.3 introduces the classical AHP eigenvector method of deriving weights, it is possible to find an alternative, mathematically consistent with AHP, and widely used in applied implementations, which is the geometric mean method. The geometric mean method gives a good approximation to the eigenvector solution to the consistent judgement matrices in addition to providing lower computing complexity and better numerical stability. The geometric mean of each criterion i is given by: , where n is the number of criteria. These values are then normalised to add up to one and the final criteria weight vector is obtained.

The TOPSIS methodology ranks stock options by computing their geometric distances to an ideal best solution and an ideal worst solution across a number of criteria dimensions in accordance with the framework described in Section 3.7.2. The ranking process is carried out in five systematic steps. The first step normalises the decision matrix by using the normalisation of vectors to transform the raw criterion values into dimensionless values that can be compared. The second step builds the weighted normalised matrix which is an accumulation of normalised values multiplied by the weight associated with each criterion, giving more weight to the criteria considered more important by the user. The third step involves finding ideal solutions by establishing maximum values of benefit criteria (DDM, DCF, RI) where larger values are preferred and minimum values are preferred for cost criteria (P/E, P/B, P/CF, P/S) where lower values are desired. Step four calculates Euclidean distances from each alternative to both the ideal best solutionand the ideal worst solution , estimating the degree to which each stock is similar to the optimal or suboptimal performance patterns. In step five, the closeness coefficient is calculated using the formula x=x+1 as defined in Section 3.7.2 with a score ranging between 0 and 1, with higher scores implying a greater degree of alignment with the ideal best solution.

One of the core characteristics of the decision analysis platform is personalisation, which enables each user to receive customised stock ratings, which represent his or her own preferences in investment. The Profile page interface enables users to customise their criteria matrix, changing the pairwise comparisons to emphasise factors that fit their investment strategy, such as focusing on cash flow stability over earnings multiples or on the overgrowth-orientated measures of dividend-based models. The market-realtime service keeps a special AhpConfig record of each user identified by his/her UserId and stores the customised pairwiseMatrix and the resulting weightsJson. In the generation of scores, the service retrieves the user-specific setup and recalculates all stock rankings, respectively, using the AHP-TOPSIS hybrid algorithm described in Section 3.7.3 so that two users looking at the same stock can have different scores provided their preferences for investments differ. This personalisation mechanism will cause the system to appear less like a one-size-fits-all recommendation engine and more like a flexible decision support tool that can also adapt to alternative investor philosophies.

.

The final ranking methodology ranks all stock options in descending order by their closeness coefficients, and this provides the user with a prioritised list with the stocks with the highest scores at the top. Such a ranking provides a useful prioritisation of portfolio construction, enabling investors to focus their attention on securities that best fit their criteria and also find potentially underpriced opportunities that require further basic analysis.

### 3.8.4 Investment Recommendation Generation and Delivery

The FinSight system uses a client-server model for data delivery in which the computational roles are shared between the client applications and the backend services. Instead of sending pre-computed final recommendations, the system provides the analysis input needed to compute scores on the client-side and generate daily recommendations, so the system can support responsive user interfaces that can instantly adapt to evolving market conditions.

The backend market-realtime service calculates and stores two important data structures of each user: weightsJson and StockYearData. The weightsJson object is the normalised weights of the AHP criteria based on the personalised pairwise comparison matrix of the user, the relative importance of each valuation criterion (DDM, DCF, RI, P/E, P/B, P/CF, P/S). The StockYearData objects contain detailed financial data on each stock, such as historical valuation ratios, intrinsic value estimates for various models, and basic performance measures. These pre-calculated data sets are stored in Redis to be quickly accessed and in MySQL to be stored.

Upon receiving a request by client applications to receive investment advice, the market-rest service reads the weightsJson (user-specific) and the entire StockYearData files of all securities under observation, serialising them to JSON and transmitting them over the REST API. Raw analytical inputs are sent to the client application instead of final scores, relocating the TOPSIS ranking calculation to the client side. The architecture offers a few operational benefits: real-time recalculation when the market prices change through WebSocket without backend round trips, real-time UI responsiveness when the user changes their filter criteria or sort preferences, and less backend computation by delegating the ranking operations to distributed client devices.

Client-side recommendation generation runs the TOPSIS algorithm with the weightsJson provided as criteria weights and StockYearData provided as the decision matrix. The client application builds the normalised decision matrix, uses the personalised weights of the user, finds the best and worst solutions using the benefit versus cost classification, and calculates the Euclidean distances to the ideal solutions and closeness coefficients of all stocks. This client-side calculation can be done in milliseconds on current hardware, allowing re-ranking in real-time as new price information is received via continuous WebSocket connections.

The delivery mechanism provides consistency and freshness of the data by coordinating caching strategies. When administrators update financial statements or when the market-realtime service recalculates valuation metrics, the system writes new StockYearData entries to MySQL and Redis, ensuring correct cache expiration policies. The requests made by subsequent clients are automatically updated with updated data, so the client-side computations are updated to use the latest fundamental analysis. The weightsJson of each user is invalidated and recreated each time the user changes his/her criteria matrix in the profile management interface, which causes immediate redistribution of the new weights to active client sessions.

# CHAPTER 4: IMPLEMENTATION AND RESULTS

## 4.1 Development Tools and Technologies

In this section, the tools, technologies, and structures employed in the process of developing this system will be introduced. All the technologies were selected based on their language strengths, like performance, scalability, easy integration, and the ability to process real-time financial data with ease.

### 4.1.1 Programing Language

TypeScript and Java were used to develop the system. TypeScript is both the frontend and the backend because it has static typing and advanced object orientation, which enhances the readability of the code and its maintainability and has fewer runtime errors. It also fits perfectly asynchronous and non-blocking I/O operations. Certain backend microservices are based on Java due to its excellent memory management, high-performance computing features, multithreading support, and integration abilities with technologies such as Kafka and MQTT. Additionally, Java is enterprise-ready and is well-known and trusted in banking systems and in large-scale enterprise applications.

### 4.1.2 Frontend Technologies

ReactJS, a component-based library, was used to design the user interface, which is known to have high performance, support DOM architecture, and highly dynamic and responsive interfaces. Its modular feature enables reusable components, enhancing not only development performance but also high maintainability. TypeScript was also used with React to enable them to have type safety, fewer program runtime errors and predictability of component behaviour. In addition, Tailwind CSS is also integrated to simplify the styling process with its utility-first philosophy, allowing design consistency, quicker UI prototyping and simpler customisation (without requiring large CSS files) and making it simpler to maintain. Finally, ReactJS, TypeScript and TailwindCSS provide a scalable and flexible frontend platform perfectly aligned with the development of real-time investment dashboards and other data-driven visual elements needed by the system.

### 4.1.3 Backend Technologies

Microservices-based backend architecture with TypeScript and Express.js as well as Java and Spring Boot to streamline the system. TypeScript is used in the general-purpose backend services, such as providing RESTful APIs and authentication services and orchestrating data, in the non-blocking I/O model to handle concurrent requests efficiently and in the extensible middleware architecture of Express.js to create APIs quickly. Java and Spring Boot are used strategically to support computationally intensive microservices, including pricing pipelines of real-time and event consumers of messages based on Kafka and MQTT protocols. This setup allows the best multithreading features of Java, optimal JVM trash collection, and the extensive SpringBoot microservices platform. The RESTful API design guarantees standardised in-house communication with loose coupling and modularity. The hybrid technology stack allows the system to use the benefits of TypeScript, fast development cycles and high-quality type safety in general services and use the benefits of Java, enterprise-grade performance and stability in high-throughput, latency-sensitive operations, at the cost of an optimal trade-off between developer productivity and computational efficiency.

### 4.1.4 Messaging and Communication Technologies

The system architecture is based on a multiprotocol messaging system to provide real-time data distribution and event-driven interaction between distributed components. Apache Kafka is scalable and fault-tolerant event streaming of continuous financial data and MQTT is ultra-low latency and lightweight publish-and-subscribe updates of high-frequency price data. Authentication, account management and transactional queries are all operations of a synchronous nature addressed in the form of RESTful APIs that provide high consistency and real-time feedback. The architecture has an efficient balance of responsiveness, throughput, and reliability by integrating each protocol to its strengths.

### 4.1.5 Database Technology

The main relational database management system in use is MySQL, which utilises its robust ACID (Atomicity, Consistency, Isolation and Durability) support in order to deliver transactional consistency and integrity, which is essential to financial applications. Data validity and reference integrity are strongly enforced within the system due to MySQL's data management functionalities. The system provides thorough validation and prevents loss of referential integrity to establish the correct relations between user accounts, financial transactions and authentication details. MySQL's efficient query optimisation engine enables retrieving and collating historical price data, user profiles, system metadata and auditing trails through efficient join and index lookups. Moreover, MySQL has demonstrated scalability, particularly with replication and partitioning schemes; its advanced tooling ecosystem to backup, monitor, and performance-tune has well supported the need to support the persistent storage demands of structured financial data whilst ensuring high availability and data integrity guarantees necessary in production-grade trading systems.

## 4.2 Investment Strategy Backtest

### 4.2.1 Methodology

To evaluate the investment-decision utility of the AHP-TOPSIS pipeline, a historical replay harness was implemented inside the market-realtime service under the backtest package. The harness reuses the production TopsisCalculator, StockValuationCalculator, and portfolio-allocation logic, so the strategy evaluated below is identical to the one served to live users.

At each annual rebalance date t, the harness constructs a point-in-time snapshot of every stock using only data observable at year-end t−1: historical year-data entries are filtered to keys ≤ t−1, the tradable price is set to priceEndYear\[t−1\], sector-median industry ratios (P/E, P/B, P/CF, P/S) are recomputed from the t−1 cross-section, and DDM, DCF, RI and relative-valuation multiples are recomputed from these t−1 inputs. This construction prevents look-ahead bias. The top-N candidates are allocated score proportionally subject to lot size and transaction cost constraints. Holdings are fully liquidated and re-allocated at each rebalance.

|     |     |
| --- | --- |
| Parameter | Value |
| Universe | HOSE-listed stocks with yearData entries for 2020–2024 |
| Backtest window | End-of-year 2020 → end-of-year 2024 |
| Annual rebalances | 4 (2021, 2022, 2023, 2024) |
| Initial capital | 1,000,000,000 VND |
| Top-N | 4   |
| Lot size | 100 |
| Transaction cost | 15 bps, round-trip |
| Benchmark | VN-Index, annual close |

Table 6: Backtest Configuration

### 4.2.2 Data and Limitations

The backtest only runs four complete rebalance cycles across 2012–2024 with N = 4 annual return observations, due to the cost of manually ingesting annual financial statements. All the performance statistics in the report below are thus descriptive and exploratory in nature; formal tests of hypothesis against the benchmark and bootstrap confidence intervals are not significant at this sample size. There are three additional restrictions. First, the universe is limited to the currently listed HOSE tickers; tickers that have been delisted since 2020 through 2024 are not included, which causes survivorship bias. Second, the size of a suitable universe to run the TOPSIS data-sufficiency filter is about six tickers, which constrains the informativeness of ranking-stability tests. Third, rebalancing only involves intra-year annual drawdowns; they are not observable at this granularity. The results below are to be read as a pilot test indicating the viability of the AHP-TOPSIS pipeline, not as a statistically verified alpha claim.

### 4.2.3 Results

|     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Year | Portfolio Value (VND) | VN-Index | Portfolio Return | VN-Index Return | Portfolio Drawdown | VN-Index Drawdown |
| 2020 | 1,000,000,000 | 1,103.90 | \-  | \-  | 0.00% | 0.00% |
| 2021 | 1,464,260,480 | 1,498.36 | +46.43% | +35.73% | 0.00% | 0.00% |
| 2022 | 1,395,673,070 | 1,006.89 | −4.68% | −32.80% | −4.68% | −32.80% |
| 2023 | 1,735,330,380 | 1,129.83 | +24.34% | +12.21% | 0.00% | −24.60% |
| 2024 | 2,081,221,970 | 1,266.78 | +19.93% | +12.12% | 0.00% | −15.46% |

Table 7: Annual Portfolio Value, Returns, and Drawdown versus VN-Index

|     |     |     |
| --- | --- | --- |
| Metric | Portfolio | VN-Index |
| Compound Annual Growth Rate (CAGR) | 20.11% | 3.50% |
| Annualized Volatility | 20.96% | 28.65% |
| Sharpe Ratio (rf = 0) | 1.03 | 0.24 |
| Sortino Ratio | 4.59 | \-  |
| Maximum Drawdown | −4.68% | −32.80% |
| Hit Rate (periods outperforming benchmark) | 4 / 4 | \-  |
| Annualized Alpha | +16.62 pp | \-  |
| Beta vs VN-Index | 0.72 | \-  |

Table 8: Performance Metrics Summary (N = 4 annual returns, 2021–2024)

The AHP-TOPSIS strategy compounded at an annual rate of 20.11% from 2020 to 2024 (vs. VN-Index's 3.50% with roughly 4 times its benchmark Sharpe ratio and 28 percentage points shallower maximum drawdowns), and had positive returns against the VN-Index for all four annual look-back periods, even through the 2022 Vietnamese equity market drawdown (where it was down 4.68% vs. The VN-Index's down 32.80%). It also had a beta of 0.72-structurally defensive relative to the index-which aligns with a value-driven selection criteria anchored to relative misvaluation of companies under the seven criteria for financial fundamental performance..

### 4.2.4 Robustness Analysis

To estimate whether the results of the headline, 4.2.3, reflect a real level of framework effect or are an artefact of a single weight choice, two additional experiments were conducted: a framework comparison experiment against three base ranking schemes and a weight-perturbation experiment across 100 randomised experiments.

|     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Method | CAGR | Sharpe | Sortino | Max DD | Hit Rate | Alpha | Beta |
| AHP-TOPSIS (hybrid) | 15.30% | 0.83 | 3.63 | −4.59% | 80% | +11.32 pp | 0.63 |
| Equal-weight TOPSIS (1/7 each) | 14.77% | 0.92 | 8.94 | −1.77% | 80% | +11.43 pp | 0.52 |
| Random-weight TOPSIS | 14.58% | 0.93 | 12.99 | −1.20% | 80% | +11.34 pp | 0.50 |
| Single-criterion P/E baseline | 9.10% | 1.58 | \-  | 0.00% | 40% | +9.25 pp | 0.00 |

Table 9: Method Comparison (identical harness, alternative ranking schemes, 2020–2024, top-N = 4)

To separate the effect of the AHP weighting in the hybrid structure, the harness was re-run with three other ranking schemes. The biggest CAGR (15.30%), however, was produced by the AHP-weighted TOPSIS variant, but nearly equal annualised alpha (11.43 pp and 11.34 pp, respectively, versus 11.32 pp of AHP) was produced by the equal-weighted and random-weighted TOPSIS variants. The single-criterion P/E baseline resulted in a materially lower CAGR (9.10%) and a 40% hit rate. This trend suggests that it is the multi-criteria structure of TOPSIS, but not necessarily the weighting calculated in accordance with AHP, that facilitated the outperformance. The AHP step can thus more aptly be described as a user-personalisation phenomenon within a paradigm with an average performance that is largely dictated by the criteria employed and the TOPSIS ranking process.

|     |     |
| --- | --- |
| Statistic | Value |
| Number of trials | 100 |
| Minimum CAGR | 10.96% |
| 25th-percentile CAGR across trials | 13.70% |
| Median CAGR across trials | 15.57% |
| 75th-percentile CAGR across trials | 17.39% |
| Maximum CAGR across trials | 18.89% |
| Trials exceeding VN-Index CAGR (3.50%) | 100 / 100 |
| Top-N portfolio overlap vs. base weights | 100% in all trials |

Table 10: CAGR Distribution across 100 Weight-Perturbation Trials

Weights sensitivity was tested by adding Dirichlet noise to the weight vector derived by the AHP and by running 100 independent 2020–2024 backtests, each with a perturbed weight vector. Across the 100 trials, realised CAGR ranged from 10.96% to 18.89% with a median of 15.57% and an interquartile range of 13.70% – 17.39%. All the trials were above the VN-Index CAGR of 3.50% within the same window. The top-N portfolio combination was the same across the 100 trials, indicating that the eligible universe following the TOPSIS data-sufficiency filter has a set of about six tickers, small by comparison with the top-4 portfolio chosen in this pilot. Ranking-stability statistics like Spearman rank correlation and top-N overlap are therefore saturated in this dataset size and will only be used in subsequent work with a larger universe.

## 4.3 System Performance Evaluation

This section presents the performance evaluation of the system under load using k6, a modern load testing tool. The tests were conducted to measure the system's response time and error rate across a range of request loads, from 100 to 1000 requests per second (RPS). All results presented are averaged over three independent test runs using valid-only data to ensure accuracy.

### 4.3.1 Test Environment and Methodology

The system was deployed on a single VPS instance, with Ubuntu 24.04.4 LTS, installed on a KVM virtualisation platform, with a 10-core Intel Xeon Platinum 8163 processor at 2.5 GHz, with 18 GB of RAM. All components, such as the microservices, message broker, and database, were co-hosted on this single instance and shared the same hardware resources, so this infrastructure limitation is a significant consideration when interpreting the performance outcomes in the subsequent subsections.

To test the performance characteristics of the system at varying levels of concurrent load, a structured load testing methodology was applied by using k6, which is an open-source load testing tool that was developed by Grafana Labs due to its capability to define complex load profiles programmatically in JavaScript, its capability to support custom metrics and per-scenario reporting, and its ability to run large numbers of virtual users (VUs) with little overhead on the test machine.

This test focused on two market-rest service instances and market-realtime running on the same physical host on ports 3000 and 3001, respectively. Each virtual user was bound to only one upstream instance during its lifetime, which was the index of the VU divided by the number of available instances. This maximised the reuse of HTTP keep-alive connections and minimised the overhead of establishing them. This setup was necessary to ensure that the latency measured was representative of real service processing time and not the overhead of repeated TCP handshakes.

Every service was deployed on one VPS, and this configuration by itself is a limiting factor in the ability of the system to support high-concurrency loads. This limitation is particularly significant for write operations because the system relies on a single-instance MySQL database, which cannot scale to handle high volumes of create or update workloads. Furthermore, password hashing with bcrypt is significantly CPU-intensive in a concurrent load, since the deliberately slow hashing algorithm can saturate the CPU usage to 100 per cent when there are many login or registration requests being serviced at once. Under such infrastructure limitations, full CRUD load testing would yield unstable and unrepresentative results of the actual read performance of the system. As such, only read-only GET endpoints were tested to guarantee consistent and repeatable results in all three test runs but also to prevent any accidental side effects on the database state.

The five API endpoints that underwent load testing were: GET /api/stock/get/:stockId, which provides detailed data about a particular stock; GET /api/stock/getAllStocksId, which provides the complete list of stock identifiers available; GET /api/user/getDetail/:userId, which returns the profile information of a user; GET /api/stockYearData/get/:stockId/:year, which retrieves the annual distribution of traffic; and GET /api/stock/get/:stockId This process was done with a fixed weighted random selection, with GET /api/stock/get/:stockId absorbing the largest share of traffic at 20% of total traffic, as this endpoint is likely to dominate in the real-world usage patterns.

The load profile was developed to be a step-ramp test, which gradually ramped the request rate between 100 RPS and 1000 RPS in 50 RPS steps and created 19 different load levels. The steps had a constant arrival rate that lasted 30 seconds, and then a 10-second idle period was added before the next step began. This period was a gap that enabled in-flight requests of the prior step to finish and VUs to be discharged without cross-contamination of metrics across steps. Each step had a k6 pre-allocation set at twice the target RPS relative to the number of VUs, with a maximum limit of five times the target RPS, which increased to a maximum of 2,000 VUs at the 1,000 RPS level. The constant-arrival-rate executor was used to ensure that the system was fed with an accurate and consistent number of requests per second irrespective of response time, and the effect of load level on performance degradation could be isolated.

The complete test sequence was performed three times under the same conditions to guarantee the reliability and reproducibility of the results. The k6 summary handler exported the raw per-run results to CSV format, which captured per-RPS values, such as average (avg), minimum (min), maximum (max), median (med), 90th percentile (p90), and 95th percentile (p95) response times, and the error rate of each load level. The latency measures in all of the following subsections are the arithmetic mean of the three runs, taken only with successful responses.

### 4.3.2 Response Time Analysis

Figure 8: Mean Latency as Load Increases

Figure 9: Median Latency as Load Increases

The system, as shown in Figure 8 (Mean Latency) and Figure 9 (Median Latency), is remarkably stable in terms of response times at all load levels tested. The average latency is initially higher than it would be at a higher concurrency, and the warm-up effect of low concurrency causes the mean latency to be slightly higher than it would be at higher concurrency and quickly drops to stabilise at a range of 4.8-5.1 ms beginning at 300 RPS. The median latency shows a comparable trend, with an initial value of 5.17ms at 100 RPS and then narrowing down to a range of 4.40-4.70ms after 300 RPS. The fact that the mean and median are virtually the same across the entire range of tests suggests that the distribution of response times is not heavily skewed by any outliers; that is, most of the requests are being served at a steady low latency independent of the load applied. Interestingly, both metrics do not exhibit an upward trend with an increase in RPS after 300, implying that the processing capacity of the system is not the limit with this workload; the services can process the incoming read requests steadily with a consistent processing speed even as the concurrency rises to 1000 RPS.

Figure 10: 90th Percentile Latency as Load Increases

Figure 11: 95th Percentile Latency as Load Increases

Figure 10 (90th Percentile Latency) and Figure 11 (95th Percentile Latency) show that tail latency of the system also exhibits similar behaviour over most of the load range tested. The P90 latency begins at about 6.25 ms at 100 RPS, declines sharply to about 5.78 ms at 200 RPS and then falls within a very narrow range of 5.59-5.80 ms between 200 RPS and 700 RPS, meaning that even the slowest 10 per cent of requests are being served consistently in this range. The P95 latency is similar to the starting values of 7.36 ms at 100 RPS and the final values of 6.83-6.43 ms at 200-700 RPS, respectively. Nonetheless, the two metrics show a significant peak at 750 RPS, with P90 increasing to 6.15 ms and P95 hitting its highest point of 7.87 ms throughout the test and returning to normal at 800 RPS. This fleeting spike can probably be explained by a temporary resource contention as the system switches into a higher concurrency regime, not a lasting slowdown. At 800 RPS and above, P90 and P95 level off at moderately higher values of about 6.13-6.18 ms and 6.83-7.01 ms, respectively, at values that are well within acceptable limits and affirm that the system is not experiencing tail latency explosion even at high load conditions.

Figure 12: Minimum Latency as Load Increases

Figure 13: Maximum Latency as Load Increases

Figure 12 (Minimum Latency) and Figure 13 (Maximum Latency) demonstrate that the minimum and maximum values of latency are the two extremes of the response time behaviour at all the load levels. The minimum latency shows a gradual and smooth decrease between about 4.04 ms at 100 RPS and a floor of about 3.47 ms at the higher load levels, where it is practically flat between 600 RPS and higher. This linear reduction is a natural effect of connection warm-up and keep-alive reuse becoming more efficient with concurrency, and the steady floor value is the theoretical best-case processing time of the system with this workload, the raw speed of the underlying microservices when it is serving a single uncongsted request.

The highest latency, however, discloses more variations in response behaviour. At 100 RPS, the largest spike of about 706ms can be observed, which can be explained by the initial establishment of the TCP connection and by the warm-up of the service at the beginning of the test instead of the actual delay of processing. After 150 RPS, the highest latency decreases drastically to about 200ms and fluctuates irregularly between about 100ms and 350ms throughout the rest of the test, without a definite upward trend as RPS increases. These sporadic peaks in maximum latency are actually consistent with outlier requests that are isolated in space and time and that actually experience brief periods of resource contention or connection queuing, as opposed to a system-wide degradation in service. Notably, the fact that maximum latency does not increase as load increases further substantiates the result that the processing pipeline in the system is not affected by increasing load, but instead exhibits an effect on the system that is a connection-level failure, rather than an effect on response time.

### 4.3.3 Error Rate and System Capacity

Figure 14: Error Rate as Load Increases

The most directional and clearest result of the entire performance assessment is the error rate chart, as shown in Figure 14 (Error Rate). In contrast to the latency metrics used in the figures above, which were generally flat with increasing load, the error rate has a steadily increasing trend as RPS increases and, therefore, is the most important metric used to show the limits of system capacity at this workload.

At 100 and 150 RPS, the system has been shown to have a 0% error rate, demonstrating that the service is fully reliable in its low workloads of concurrency. A low error rate of 0.07 per cent is first observed at 200 RPS, then changes at a slow rate up to around 0.31 per cent at 250 and 300 RPS. Starting with 350 RPS, the error rate starts increasing steadily, to about 1.00 per cent at 400 RPS, 1.64 per cent at 450 RPS, and 2 per cent at 500 RPS. The rate also steadily rises in the 600-700 RPS level to about the 2.90-3.19% range before levelling off to the 3.63-4.21% range between 800 RPS and 1000 RPS. The slow flattening of the curve after 800 RPS is an indication that the system has reached some saturation point where the same percentage of requests are always rejected by the connection-level constraints but the failure rate does not drastically increase beyond that.

The results obtained show that the safe operating point of the system when operating under read-only workloads is around 300 RPS, and beyond this point the error rates start to increase steadily. Importantly, the fact that latency does not increase with errors confirms that the bottleneck is not processing speed but rather the ability of the system to accept and queue inbound connections, a property that is consistent with the constraints of a single VPS deployment where all services share a limited pool of network and OS-level resources.

On the whole, the performance testing indicates that the system, even though it is implemented on a single VPS instance, can withstand stable and consistent response times at all the tested load levels between 100 and 1000 RPS. The metrics of latency, such as mean, median, percentile and boundary values, do not exhibit any significant degradation with an increase in concurrency, thus indicating that the microservices architecture can handle read workloads effectively without the introduction of processing bottlenecks. The main bottleneck of the system in the deployment configuration as of now is connection-level capacity, not the computational throughput, as can be observed by the continuously increasing error rate beyond 300 RPS while latency remains flat. The system is capable of providing a reliable and predictable performance within the safe operating range of up to 300 RPS, which is suitable in a real-world usage scenario with moderate concurrent user loads. Beyond this point, scaling would require infrastructure upgrades like horizontal scaling of service instances, load balancer configuration, or moving to a multi-node deployment environment.

## 4.4 Results and Screenshots

FinSight has a frontend interface which is designed to include two functional divisions, namely core analytical modules and system support features. The academic core of the system is the Core Analytical Modules, which include the Dashboard, Stock Scanner, Stock Detail View, and Portfolio Allocator. They are a direct realisation of the AHP-TOPSIS multicriteria decision-making method and the intrinsic valuation models (DDM, DCF, residual income, and models that depend on multiples). It is in these modules that users engage with quantitative results, set up parameters of analysis, and generate investment insights. By contrast, the system support features include the authentication module, user profile and AHP configuration, subscription and pricing, admin panel, and general system layout and navigation features, which, however, do not analyse anything in themselves but provide the structural, configuration, and access control scaffolding on which the modules of analysis rely. A combination of the two divisions is a single-page React/React Router application with a support layer that guarantees the integrity of data, session management, and role-based access and an analytical layer that provides the main contribution of this work: the decision-support functionality.

### 4.4.1 Core Analytical Modules

The Dashboard is the main entry point after a successful authentication, which gives users an immediate analytical overview of their portfolio environment and the current market environment. The interface is designed to showcase four StatCard elements that reveal important summary metrics such as the total number of stocks being followed, the average TOPSIS score of the watchlist, the best-performing stock symbol, and the subscription level the user is on. More importantly, the TOPSIS scores are calculated on the client side during each render by calling the computeTopsis function, which uses personalised AHP weights loaded through the useAhpWeights hook, ensuring that all displayed metrics are based on the investment priorities that the user has most recently configured. The main area displays a live Vietstock technical chart of any chosen symbol, and a watchlist panel on the right provides real-time prices over an MQTT connection, with flash animations indicating a price change. Favorites panel is another complementary feature that shows mini cards of the bookmarked stocks with essential financial ratios instantly. All these factors make the Dashboard not only a landing page but also a multi-criteria decision-support hub that integrates TOPSIS-based analytical results with real-time market data to facilitate uninterrupted investment monitoring.

Figure 15: Dashboard Page

The Stock Scanner is the main discovery and ranking tool in FinSight, which displays the entire universe of available stocks in a sortable data table, sorted by TOPSIS score in descending order by default. The buildMetrics function builds up the appropriate financial criteria, which are then inputted into computeTopsis together with the individual user-specific AHP weights to generate a rank score indicating the investment priorities of the individual user, as opposed to any generic standard. The stock in each row of the table will show the stock symbol, name, industry, and the live stock price, updated in real time via MQTT with a flash animation on each tick as well as a ScoreBar component which provides a real-time representation of the calculated TOPSIS score. Users can then further refine the ranked list using a search bar that can filter results by either ticker symbol or company name and a sector dropdown that can narrow results down to a particular industry segment. The additional distributional context for the interpretation of individual rankings is given by the summary statistics above the table, such as the mean score and the maximum and minimum score. Watchlist and favourite buttons on the row enable users to continue to track stocks of interest without using the scanner interface by navigating to the other screen.

Figure 16: StockScanner Page

Stock Detail View offers an in-depth analytical deep dive into any given stock, structured within three dedicated tabs: Technical Chart, Financials and Valuation, each focusing on a different aspect of the investment analysis. The page header shows the symbol of the stock, the parent company, live price implemented in a PriceTag element with MQTT-fuelled flash pricing, a sector label, and a favourite button to create instant market context before interacting with the analysis beneath. The Technical Chart tab provides access to price-action history and technical indicators by embedding a Vietstock iframe without the need to leave the application. The Financials tab is a tab that allows you to choose a year (selecting a year will dynamically update FinancialBarChart visualisations of revenue, net income, and Cash Flow over the selected year with a corresponding ratio table of important valuation multiples such as P/E, P/B, P/CF and P/S. The Valuation tab is an extension of the analysis that provides ValuationLineChart outputs of three intrinsic valuation models: the Dividend Discount Model (DDM), Discounted Cash Flow (DCF) and Residual Income (RI) over a series of years, and a RatioCompareChart plots the stock's valuation ratios against industry average valuation ratios within the stock industry peer group. To reduce the number of unnecessary API calls, each per-symbol piece of information is stored in the browser cache the first time the view is opened, which means that the user will have an interactive experience although the depth of the analytical view may be large.

Figure 17: Stock Details Page

The Portfolio Allocator is a program that converts the multi-criteria analytical results of the system into a concrete, actionable investment plan, bridging the gap between quantitative stock ranking and real-world portfolio construction. The user will start by entering an input form that will specify three allocation constraints: the total available budget in VND, the number of stocks desired to be included, and a lot size constraint that will reflect the minimum of the tradeable units on the target equity market. With these parameters, the system uses the AHP-weighted TOPSIS scores of the user to select the best N-ranked stocks. It then calculates a proportional allocation plan where each stock share in the total budget is determined by its relative TOPSIS score such that the capital distribution is driven by the same personalised multi-criteria model that drives the Scanner and Dashboard and not by arbitrary or equal-weight assumptions. The output is provided in two complementary forms: a PortfolioPieChart which graphically conveys the percentage allocation among the selected stocks, and a structured allocation table which specifies, per stock, the amount of money that should be invested and the corresponding number of lots of the stock that can be purchased given the specified constraint. This two-fold representation supports both the high-level review of the portfolio composition and the accurate planning of the execution, placing the Portfolio Allocator as the final decision-support module through which the system AHP-TOPSIS methodology is most directly operationalised into investment action.

Figure 18: Portfolio Allocator Page

### 4.4.2 System Support Features

The Authentication Module is the secure gateway to the FinSight system and offers access control via credentials. Using a tab-based interface, it displays sign-in and register forms on a single screen. The Register form will gather the necessary user attributes, including the following: username, email, password, and phone number, and the two forms will be subject to client-side validation before being submitted. When the user successfully logged in, the JWT token issued by the server remained in localStorage and was leaked application-wide via the useAuth hook, which offers application-wide access to the authenticated user, including their userId and userDetail without needing to call the API again. ProtectedRoute components that surround all non-public routes consume this authentication context, and unauthenticated users are automatically redirected to the login screen on any attempt to access secured pages, and the AdminRoute guard applies an additional role-based access control to the routes that are only accessible to administrators. The Authentication Module is not directly involved in the analytical capabilities of the system but is a critical precondition, defining the identity of the user on which personalised AHP weights, gating by subscription tier, and watchlist persistence are all built.

Figure 19: Login Page

The User Profile and AHP Configuration page is the personalisation backbone of the FinSight system that integrates standard account management with the key AHP matrix editor that manages all multi-criteria analytical outputs throughout the application. The profile section can be edited to include fields of username, email and phone number, with a separate password change form, which allows users to maintain the correct information in their accounts regardless of their analytical configuration. The analytically important element of this page is the AHP matrix editor, which displays a 7x7 pairwise comparison matrix in which users indicate their relative investment priorities of seven valuation criteria: DDM, DCF, Residual Income, P/E, P/B, P/CF and P/S, with the nine-point Saaty scale used to provide comparison values between each pair of criteria. When submitted, the system will derive normalised criteria weights based on the completed matrix, which is immediately plotted in an AhpWeightsBarChart to permit users to confirm that the resulting weight distribution is correct with their desired priorities before the configuration is finalised. These weights are saved and then distributed worldwide through the useAhpWeights hook to the Stock Scanner, Dashboard, and Portfolio Allocator and directly affect the computation of TOPSIS score and capital allocation advice, which sets the AHP configuration, not as a settings page, but as the core parametric input whereby each user analysis experience is personalised.

Figure 20: User Profile & AHP Configuration Page

The Admin Panel is an administrative interface, which only those accounts with the administrator role can access and is implemented on a routing level by the AdminRoute guard, which blocks access to the contents of the Admin Panel to any non-admin account. The panel is divided into three functionalities, namely, stock management, year data administration and user account management. In the stock management section, administrators can add, modify and delete stock records and define and update industry-average ratios at a sector level, which are then fed to the RatioCompareChart of the Stock Detail View to compare individual stocks with their peers in the industry. The year data section facilitates bulk loading of historical financial data in the form of Excel files to enable administrators to populate per-stock, per-year financial records upon which the FinancialBarChart visualisations and computations of DDM, DCF and Residual Income valuation models are based and shown to the final consumers. Searching is possible in the user management area, either by email or username. The administrator can view and update user profiles, reset account passwords, and delete accounts when needed. The relevance and completeness of the data stored in the Admin Panel are the immediate preconditions of the quality of the TOPSIS rankings, valuation outputs, and industry comparisons that compose the analytical core of the system that makes this back-office interface an inalienable operational dependency of the FinSight platform.

Figure 21: Admin Panel Page

FinSight system layout and navigation structure: Optimised as a Single Page Application (SPA) on React with React Router, the FinSight client-side navigation ensures client-side navigation through all modules without a complete page reload. Since all of the authenticated pages are wrapped in a persistent AppShell component, the component consists of a fixed sidebar and a top bar that appears consistently, independent of the active route, the sidebar being a demonstration of navigation links to the Dashboard, Stock Scanner, Stock Detail View, Portfolio Allocator, User Profile, Subscription, and Admin Panel, and the top bar being a display of contextual information, including the user's current subscription tier. Access control to routes is implemented by two guard elements, ProtectedRoute and AdminRoute, respectively, redirecting unauthenticated users to the login screen and additional access control on administrative routes to accounts with the administrator role that ensures role-based access controls are implemented at the navigation level instead of just the API level. The entire design is assembled with Tailwind CSS grid and flexbox utilities, resulting in a responsive layout that modulates the proportional ratio of the sidebar and content area with the different screen sizes without the need to define individual layouts per breakpoint. Together this architectural shell guarantees that the boundaries between the system analytical and support modules are architecturally united and navigably sound and access-controlled where needed in the application.

# Chapter 5: Discussion and Evaluation

## 5.1 Introduction

In this chapter, the design and implementation of FinSight is compared to the theoretical basis and the current platforms that exist in Chapter 2. The discussion is structured in four dimensions, namely, theoretical soundness (fidelity to the reviewed valuation and MCDM models), practical applicability (within the target emerging equity market context), novelty (contributions are not found in the reviewed literature or in existing platforms), and recognised limitations (defining future development directions). Sections 5.2 and 5.3 discuss the choice of the valuation model and the AHP-TOPSIS instantiation of FinSight, respectively; Section 5.4 compares it to the six platforms reviewed.

## 5.2 Discussion of Valuation Model Selection and Implementation

The valuation layer of FinSight incorporates four types of fundamental analysis models: DDM, DCF, Residual Income, and relative multiples, each chosen based on the notion of theoretical complementarity and on practical applicability to the Vietnamese equity market, and NAV was intentionally omitted due to it being theoretically unsuitable for operating-intensive equities that comprise the target universe of FinSight. DDM is applied to the Gordon Growth Model when a stock has a zero dividend. When the model gives null, it is not included in the composite instead of yielding an invalid estimate, which is a direct remedy to the practical failure mode \[2\]. DCF is applied as a 5-year FCFF projection where the terminal value is limited to 3% perpetuity and annual growth rates are limited to within +100 and -50, respectively, partially solving the WACC sensitivity problem \[4\], but with the discount rate specified by the user, which is a known drawback. The Residual Income model is based on the Ohlson (1995) \[6\] formulation, which uses tangible book value and a 60% earnings persistence factor that is in line with the linear information dynamic of the formulation; the choice is theoretically justifiable in the target market context, where Wafi et al. (2015) \[1\] assert that RI is the most reasonable valuation model in emerging markets where semi-strong efficiency cannot be assumed. Relative multiples: P/E, P/B, P/CF and P/S are compared with the median of the industry sector instead of individual market prices, which eliminates the semi-efficiency assumption that was used in Chapter 2 and converts each ratio into a type of benefit criterion to be used further in the TOPSIS ranking. Instead of depending on any one model, FinSight combines all available outputs into a composite median fair value, which offers an intrinsic robustness to both outlier estimates and missing values, a strategy of aggregation of outputs which is not seen in any of the reviewed platforms in Chapter 2, and an approach which directly mitigates the identified weaknesses of the individual model-level discussions.

## 5.3 Discussion of AHP-TOPSIS Framework Implementation

FinSight implements the AHP-TOPSIS hybrid framework as a two-stage pipeline in which user-derived criterion weights are passed directly into a full TOPSIS ranking procedure, extending the approach into automated portfolio construction a practical engineering contribution not discussed in the reviewed literature. In the AHP stage, each user constructs a 7×7 pairwise comparison matrix using Saaty's 1–9 scale, from which criterion weights are derived via the geometric mean method rather than the eigenvalue approach. This computationally simpler approximation is appropriate for the seven-criterion scale employed. The per-user weight derivation enables investors with different analytical orientations value-focused or growth-focused to produce personalised rankings from the same underlying data, consistent with Bahmani et al.'s \[22\] finding that AHP accommodates investor-specific factor preferences effectively.

It needs to be noted, though, that the current implementation of FinSight does not calculate the Consistency Ratio (CR), which is identified by Saaty as the most significant guard against logically incoherent pairwise judgements. It is an exception to the theoretical requirement examined in Chapter 2 and is identified as one of the shortcomings of the current system. A complete standard pipeline is used in the TOPSIS stage: the normalisation of vectors, the construction of weighted matrices, the identification of the Positive and Negative Ideal Solutions, the computation of the Euclidean distance and the derivation of the closeness coefficient. All seven criteria are pre-converted with the intent of benefit-type indicators in such a way that higher values put uniform pressure on the lower values to send stronger undervaluation signals, addressing the mixed-direction criterion problem in a clean manner.

One of the known limitations of this setting, as referred to by Chen and Hwang \[13\], is that the standard Euclidean distance fails to record that there may be correlation among criteria. Since the financial ratios including P/E and P/B have overlapping denominators, correlated criteria could slightly skew the results of rankings. A Mahalanobis \[15\] distance extension is a direction towards further work. Beyond the ranking step, FinSight adds an eight-indicator overvaluation detection layer with four multiples, a PEG ratio, and three intrinsic model comparisons with a majority vote threshold of ≥50%. This is a complementary screening mechanism which forms an original contribution of the system not covered in the MCDM literature reviewed in Chapter 2.

Taken together, FinSight's AHP-TOPSIS pipeline matches the hybrid framework validated by Mahmoodzadeh et al. \[15\] and the equity selection findings of Pătări et al. \[19\], while extending both through the addition of score-proportional portfolio allocation and overvaluation detection, forming an end-to-end decision support workflow not observed in any reviewed platform.

## 5.4 Comparative Evaluation Against Existing Platforms

To place FinSight contributions in context, this section compares the system to the six platforms discussed in Chapter 2 in seven areas: coverage of valuation models, MCDM ranking, personalised weighting, portfolio allocation, architectural design, emerging market focus and extensibility. Table 10 summarises the comparisons.

The reviewed system, FinSight, is the only one that has incorporated MCDM-based ranking, personalised criterion weighting and automated portfolio allocation all at the same time, an area of functionality that is not found in any single platform within the set compared. The closest analogues of intrinsic valuation are found among the reviewed platforms, Stock Rover and GuruFocus, but both are based on proprietary scoring systems, obscuring the underlying model logic in contrast to the fully transparent multi-model median of FinSight, where the contribution of each contributing valuation is traceable and reproducible. Finviz and TradingView are more of screening and visualisation engines than valuation engines; both lack an intrinsic model of value and a systematic ranking mechanism and are more of complementary discovery interfaces than decision support systems. Yahoo Finance and Seeking Alpha are aggregation and content sites, which provide ratio displays and analyst commentary but do not have a programmatic valuation pipeline and thus are structurally incomparable to the FinSight analytical workflow. The only other platform reviewed that focuses on the Vietnamese market is ENSA, which, like FinSight, is geographically focused, but its interface is chatbot-based and does not conduct quantitative ranking, portfolio building, or multi-model valuation and can therefore be described as an information retrieval system rather than a decision support system. Only TradingView, ENSA and FinSight show significant coverage on the dimension of emerging market focus, but TradingView only supports charting and price-related data but not fundamental valuation and ranking pipelines, making FinSight the only platform with both domestic equity market focus and full quantitative valuation and ranking pipelines.

|     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dimension | Stock Rover | Guru<br><br>Focus | Finviz | Trading<br><br>View | Yahoo Finance | ENSA | FinSight |
| Valuation models | Fair value est. | DCF + GF Value | Ratios only | Limited | Ratios only | Ratios | DDM+DCF+RI+Multiples |
| MCDM ranking | No  | No  | No  | No  | No  | No  | AHP-TOPSIS |
| Personalised weights | No  | No  | No  | No  | No  | No  | Yes (AHP per user) |
| Portfolio allocation | No  | No  | No  | No  | No  | No  | Yes (score-proportional) |
| Emerging market focus | No  | Partial | No  | Yes | Partial | Yes | Yes |

Table 11: Comparative evaluation of FinSight against existing platforms

# Chapter 6: Conclusion and Future Work

## 6.1 Conclusion

This thesis has introduced a microservices-based decision support system called FinSight that shows the possibility of incorporating basic valuation analysis and multi-criteria decision-making into a distributed, event-driven system that fits the Vietnamese equity market. The idea was inspired by the apparent gap in the current retail investment tool landscape: no platform reviewed would provide a combination of composite fundamental valuation, customised multi-criteria ranking, and automated portfolio allocation in a single, scalable platform available to individual investors.

The system provides all of these against the five objectives outlined in Section 1.3. The architecture achieves a six-service microservices design: collector, realtime, REST, ingestion, webhooks, and frontend, which are coordinated through Apache Kafka event streaming. The two complementary pipelines are used to obtain financial data: a real-time DNSE MQTT price feed of live market data and an Excel-based ingestion workflow of periodic fundamental statements. The seven models that are used to determine valuation are income models (DDM, DCF, and Residual Income) and relative multiples (P/E, P/B, P/CF, and P/S), whose results are combined to form a composite median fair value to guarantee a high level of robustness against outlier estimates. The backend is split into a Java Spring Boot service to compute intensive tasks and a TypeScript/Express API gateway, with a React single-page app in the front. Stock ranking is motivated by AHP-TOPSIS: the user creates a personalised 7×7 pairwise comparison table based on which the weights of the criteria are obtained using the geometric mean aggregation method, and TOPSIS proximity coefficients then generate a personalised ranking. The allocation of portfolios is based on score-proportional budget allocation. The system was able to maintain a consistent mean response latency of 4.8-5.1 ms under load testing at a range of 100-1,000 requests per second with a realistic deployment limit of 300 RPS on a single VPS instance.

A number of contributions to this work are not present in any of the platforms surveyed in Chapter 2. The composite median fair value mechanism is a method that combines seven heterogeneous model outputs to reduce the bias of any one outlier estimate. The overvaluation detection module uses an eight-indicator majority-vote rule to generate automated watchlist email alerts. The user-driven portfolio allocation is based on the AHP-TOPSIS scores of the user instead of equal weighting or heuristic. The individualised AHP matrix of each user generates a unique TOPSIS ranking, as opposed to the one-size-fits-all method used by current screeners.

Collectively, these findings indicate that an organically coupled system of microservices architecture, event-based data streaming and MCDM algorithms can be installed as a viable investment decision support system, a system that, as far as the author is aware, has never been implemented in the literature or commercial products.

## 6.2 Future Work

While FinSight fulfils its stated objectives, several limitations identified during development and evaluation point to concrete directions for further improvement.

### 6.2.1 AHP Consistency Ratio Enforcement

The current implementation accepts any pairwise comparison matrix submitted by the user without validating its internal consistency. As noted in Section 5.3, this means logically contradictory judgements, for example, a user who rates criterion A over B, B over C, yet C over A such judgements are silently propagated into the weight derivation. Future work should implement Saaty's Consistency Ratio check, rejecting or flagging matrices where CR ≥ 0.1, and providing guided correction prompts to help users revise their inputs toward a coherent set of preferences. This would strengthen the theoretical validity of the AHP weighting stage and improve the reliability of downstream TOPSIS rankings.

### 6.2.2 Advanced MCDM Methods

The current implementation of TOPSIS uses standard Euclidean distance where all criteria are independent. Practically, a number of criteria have structural dependencies, P/E and P/B, such as both use book value in the denominators, and this may add redundancy to the distance calculation. To take into consideration inter-criterion correlation, a near-term extension would substitute Euclidean distance by Mahalanobis distance. On a larger scale, other MCDM techniques, including VIKOR, PROMETHEE, or ELECTRE, might be compared and contrasted with the existing AHP-TOPSIS pipeline. The Analytic Network Process (ANP) is a more long-term alternative that explicitly models the interdependencies between criteria in the weighting process itself.

### 6.2.3 Automated Financial Data Ingestion

Currently, as described in Section 3.8.1, financial statement information is ingested via administrator-supplied Excel files, which has added manual effort, latency in updates and human error. A stronger solution would combine the direct API connectivity to the existing financial data providers to automate the filling of the annual and quarterly financial statements. This would remove the administrative bottleneck and the possibility of stale data being used in the valuation outputs and allow more frequent model recalculation.

### 6.2.4 AI and Machine Learning Integration

There are a number of improvements that need predictive modelling that are not within the scope of the current system. Time-series forecasting applications: LSTM networks or the Prophet model could substitute the administrator-supplied growth rate assumptions that are now used in the computation of the DCF to base the forecast on past trends instead of hand estimates. NLP of financial news, annual reports, or transcripts of earnings calls may produce a quantitative sentiment score that can be included as an extra TOPSIS criterion. Models of anomaly detection might also be used to enhance the quality of data by indicating statistically unusual values within the financial statements read prior to their proliferation into the valuation models.

### 6.2.5 Infrastructure Scaling and SaaS Deployment

Section 4.3.3 load testing determined a safe throughput ceiling of about 300 RPS on the existing single-VPS deployment. Scaling further beyond this point will need a switch to container orchestration: to package all six services with Docker Compose as a stepping stone, then migrate to Kubernetes to allow horizontal auto-scaling of the most load-sensitive services, i.e., market-rest and market-realtime. At the data layer, adding MySQL read replicas would relieve contention during read-intensive workloads, and a Redis Cluster would decrease the number of re-computations needed to retrieve common valuation results. The alterations would also facilitate the exposition of FinSight as a multi-tenant SaaS platform with tiered access to the API, which would expand the current Free and Pro subscription model to include a larger number of users.

### 6.2.6 Feature Extensions and Backtesting

A backtesting module would be the most straightforward approach to empirically test the system's investment recommendations. Playing past TOPSIS ranks against historical prices and returns would give the ability to measure the predictiveness of the AHP-weighted scores to future stock prices, thus providing evidence-based justification for the AHP-TOPSIS approach not only through the theoretical discussions outlined in Chapter 2 but also through a quantifiable measurement. Extensions may include the creation of a mobile application utilising the REST API in order to increase the reachability of the system and price target notifications in order to supplement the current overvaluation alert system.

# REFERENCES

|     |     |
| --- | --- |
| \[1\] | A. S. Wafi, H. Hassan and A. Mabrouk, “Fundamental Analysis Models in Financial Markets - Review Study,” _Procedia Economics and Finance,_ vol. 30, pp. 939-947, 2015. |
| \[2\] | Z. Bodie, A. Kane and A. J. Marcus, Investments, New York: McGraw-Hill/Irwin, 2009. |
| \[3\] | T. Copeland, T. Koller and J. Murrin, Valuation: Measuring and Managing the Value of Companies, 1st ed., New York: John Wiley & Sons, 1990. |
| \[4\] | M. Vayas-Ortega, J. P. Riascos and C. Contreras-Restrepo, “On the Differential Analysis of Enterprise Valuation Methods as a Guideline for Unlisted Companies Assessment (I): Empowering Discounted Cash Flow Valuation,” _Applied Sciences,_ vol. 10, no. 17, p. 5875, 2020. |
| \[5\] | S. H. Penman, “Return to Fundamentals,” _Journal of Accounting, Auditing & Finance,_ vol. 7, no. 4, pp. 465-482, 1992. |
| \[6\] | J. A. Ohlson, “Earnings, Book Values, and Dividends in Equity Valuation,” _Contemporary Accounting Research,_ vol. 11, pp. 661-687, 1995. |
| \[7\] | V. L. Bernard, “Accounting-based valuation methods, determinants of market-to-book ratios, and implications for financial statements analysis,” University of Michigan Business School, 1994. |
| \[8\] | S. H. Penman and T. Sougiannis, “A comparison of dividend, cash flow, and earnings approaches to equity valuation,” _Contemporary Accounting Research,_ vol. 15, no. 3, pp. 343-383, 1998. |
| \[9\] | R. Frankel and C. M. C. Lee, “Accounting valuation, market expectations, and cross-sectional stock returns,” _Journal of Accounting and Economics,_ vol. 25, no. 3, pp. 283-319, 1998. |
| \[10\] | P. M. Dechow, A. P. Hutton and R. G. Sloan, “An empirical assessment of residual income valuation model,” _Journal of Accounting and Economics,_ vol. 26, no. 1-3, pp. 1-34, 1999. |
| \[11\] | D. Burgstahler and I. Dichev, “Earnings, adaptation and equity value,” _The Accounting Review,_ vol. 72, no. 2, pp. 187-215, 1997. |
| \[12\] | T. L. Saaty and L. G. Vargas, The Analytic Hierarchy Process, New York: Springer, 2022. |
| \[13\] | S. J. Chen and C. L. Hwang, Fuzzy Multiple Attribute Decision Making Methods, Springer‑Verlag, Berlin Heidelberg, 1992. |
| \[14\] | N. Alptekin, “Performance evaluation of Turkish Type A mutual funds and pension funds by using TOPSIS,” _International Journal of Economics and Finance Studies,_ vol. 1, no. 1, pp. 11-22, 2009. |
| \[15\] | S. Mahmoodzadeh, J. Shahrabi, M. Pariazar and M. S. Zaeri, “Project selection by using fuzzy AHP and TOPSIS technique,” _World Academy of Science, Engineering and Technology,_ vol. 30, pp. 333-338, 2007. |
| \[16\] | T. L. Saaty, “How to make a decision: The analytic hierarchy process,” _European Journal of Operational Research,_ vol. 48, no. 1, pp. 9-26, 1990. |
| \[17\] | G.-H. Tzeng and J.-J. Huang, Multiple Attribute Decision Making: Methods and Applications, 1st ed., New York: Chapman and Hall/CRC, 2011. |
| \[18\] | E. K. Joughi (Karimi Joughi), “An AHP-TOPSIS based approach to portfolio selection,” _Global Journal of Management Studies and Researches,_ vol. 3, no. 1, pp. 31-35, 2016. |
| \[19\] | E. Pätäri, V. Karell, P. Luukka and J. S. Yeomans, “Comparison of multicriteria decision-making methods for equity portfolio selection: The US evidence,” _European Journal of Operational Research,_ vol. 265, no. 2, pp. 655-672, 2018. |
| \[20\] | P. Xidonas, G. Mavrotas, C. Zopounidis and J. Psarras, “IPSSIS: An integrated multicriteria decision support system for equity portfolio construction and selection,” _European Journal of Operational Research,_ vol. 210, no. 2, pp. 527-536, 2011. |
| \[21\] | A. Damodaran, Investment Valuation: Tools and Techniques for Determining the Value of Any Asset, 3rd ed ed., Wiley, 2012. |
| \[22\] | M. Velasquez and P. T. Hester, “An analysis of multi-criteria decision making methods,” _International Journal of Operations Research,_ vol. 10, no. 2, pp. 55-56, 2013. |
| \[23\] | J. Charouz and J. Ramík, “A multicriteria decision making approach to portfolio management,” _Ekonomika a Management,_ no. 1, pp. 44-52, 2010. |
| \[24\] | N. Bahmani, D. Yamoah, P. Basseer and F. Rezvani, “Using the analytic hierarchy process to select investment in a heterogeneous environment,” _Mathematical Modelling,_ vol. 8, no. 3-5, pp. 157-162, 1987. |