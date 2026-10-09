// ============================================================
// STATISTICS CARDS COMPONENT
// Enterprise HRMS Dashboard
// ============================================================

import React from "react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";

import "./StatisticsCards.css";


// ============================================================
// PROPS
// ============================================================

export interface StatisticsCardsProps {
    totalRequests: number;
    pending: number;
    approved: number;
    rejected: number;
}


// ============================================================
// CARD DATA TYPE
// ============================================================

interface StatisticsCardData {
    id: string;
    title: string;
    value: number;
    footer: string;
    color: string;
    backgroundColor: string;
    icon: React.ElementType;
}


// ============================================================
// SPARKLINE
// ============================================================

interface SparklineProps {
    color: string;
}

const Sparkline: React.FC<SparklineProps> = React.memo(({ color }) => {
    return (
        <svg
            className="stat-card-sparkline"
            viewBox="0 0 120 28"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="
                    M0 19
                    L10 13
                    L20 21
                    L30 11
                    L40 18
                    L50 15
                    L60 7
                    L70 15
                    L80 23
                    L90 12
                    L100 18
                    L110 10
                    L120 6
                "
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
});

Sparkline.displayName = "Sparkline";


// ============================================================
// STATISTICS CARDS
// ============================================================

const StatisticsCards: React.FC<StatisticsCardsProps> = React.memo(
    ({
        totalRequests,
        pending,
        approved,
        rejected,
    }) => {

        // ====================================================
        // CARD CONFIGURATION
        // ====================================================

        const cards: StatisticsCardData[] = [
            {
                id: "total",
                title: "Total Requests",
                value: totalRequests,
                footer: "This Month",
                color: "#0F8A48",
                backgroundColor: "#E8F7EE",
                icon: FileText,
            },
            {
                id: "pending",
                title: "Pending Requests",
                value: pending,
                footer: "Needs Attention",
                color: "#F57C00",
                backgroundColor: "#FFF3E2",
                icon: Clock,
            },
            {
                id: "approved",
                title: "Approved Requests",
                value: approved,
                footer: "This Month",
                color: "#0F8A48",
                backgroundColor: "#E8F7EE",
                icon: CheckCircle,
            },
            {
                id: "rejected",
                title: "Rejected Requests",
                value: rejected,
                footer: "This Month",
                color: "#D32F2F",
                backgroundColor: "#FDEBEC",
                icon: XCircle,
            },
        ];


        // ====================================================
        // RENDER
        // ====================================================

        return (
            <section
                className="statistics-cards-container"
                aria-label="Resignation statistics"
            >

                {cards.map((card) => {

                    const Icon = card.icon;

                    return (
                        <article
                            key={card.id}
                            className="statistics-card"
                        >

                            {/* =====================================
                                CARD HEADER
                               ===================================== */}

                            <div className="stat-card-header">

                                <div
                                    className="stat-icon-box"
                                    style={{
                                        backgroundColor:
                                            card.backgroundColor,
                                        color: card.color,
                                    }}
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <span className="stat-card-title">
                                    {card.title}
                                </span>

                            </div>


                            {/* =====================================
                                CARD METRIC
                               ===================================== */}

                            <div className="stat-card-metric">

                                <span className="stat-card-value">
                                    {card.value}
                                </span>

                                <span
                                    className="stat-card-footer"
                                    style={{
                                        color: card.color,
                                    }}
                                >
                                    {card.footer}
                                </span>

                            </div>


                            {/* =====================================
                                CARD CHART
                               ===================================== */}

                            <div className="stat-card-chart">
                                <Sparkline
                                    color={card.color}
                                />
                            </div>

                        </article>
                    );
                })}

            </section>
        );
    }
);


StatisticsCards.displayName = "StatisticsCards";

export default StatisticsCards;