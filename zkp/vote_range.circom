template VoteRange() {
    signal input x;
    signal input min;
    signal input max;

    // Range check dummy (bukan ZK, hanya constraint nyata)
    signal a; a <== x - min;
    signal b; b <== max - x;

    // Dummy constraints (pisahkan setiap operasi)
    signal t1; t1 <== x * x;
    signal t2; t2 <== min * max;
    signal d1; d1 <== t1 + t2;

    signal t3; t3 <== a * b;
    signal d2; d2 <== t3 + x;

    signal d3; d3 <== d1 + d2;
    signal t4; t4 <== d3 * 2;
    signal d4; d4 <== t4;

    signal t5; t5 <== d4 + 1;
    signal d5; d5 <== t5;

    signal t6; t6 <== d5 * 3;
    signal d6; d6 <== t6;

    signal t7; t7 <== d6 + 2;
    signal d7; d7 <== t7;

    signal t8; t8 <== d7 * 4;
    signal d8; d8 <== t8;

    signal t9; t9 <== d8 + 3;
    signal d9; d9 <== t9;

    signal t10; t10 <== d9 * 5;
    signal d10; d10 <== t10;
}
component main = VoteRange();